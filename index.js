if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Core Node modules
const path = require("path");

// Third-party packages
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate");
const connectFlash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const helmet = require("helmet");

//use in production
const dbURL = process.env.MONGOPASS;
const secret = process.env.SECRET || "thisshouldbeabettersecret!";
const port = process.env.PORT || 3000;

// Middleware and view engine setup
app.set("view engine", "ejs"); // Set EJS as the view engine
app.set("views", path.join(__dirname, "views")); // Set views directory
app.use(express.static(path.join(__dirname, "public")));
app.set("public", path.join(__dirname, "public")); // Set public directory
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(methodOverride("_method")); // Allow method override for forms
app.engine("ejs", ejsmate); // Use ejs-mate for layouts
app.use(express.json()); // Parse JSON bodies

// Security middleware - updated CSP sources
const scriptSrcUrls = [
  "https://cdn.jsdelivr.net",
  "https://cdn.jsdelivr.net/npm", // allows Bootstrap bundle and other npm-based CDN paths
  "https://stackpath.bootstrapcdn.com", // legacy Bootstrap CDN (kept for compatibility)
  "https://api.tiles.mapbox.com",
  "https://api.mapbox.com",
  "https://kit.fontawesome.com",
  "https://cdnjs.cloudflare.com",
];
const styleSrcUrls = [
  "https://cdn.jsdelivr.net",
  "https://kit-free.fontawesome.com",
  "https://stackpath.bootstrapcdn.com",
  "https://api.mapbox.com",
  "https://api.tiles.mapbox.com",
  "https://fonts.googleapis.com",
  "https://use.fontawesome.com",
];
const connectSrcUrls = [
  "https://api.mapbox.com",
  "https://*.tiles.mapbox.com",
  "https://events.mapbox.com",
  "https://res.cloudinary.com", // allow image uploads/Cloudinary responses if used by client
];
const fontSrcUrls = [
  "https://fonts.gstatic.com",
  "https://use.fontawesome.com",
];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/", // allow any Cloudinary resource (and keep specific cloud name if you want)
        `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`, // optional specific path
        "https://images.unsplash.com",
        "https://picsum.photos",
        "https://imgs.search.brave.com",
        "https://api.mapbox.com",
        "https://*.tiles.mapbox.com",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  }),
);

//check for states

// Models
const campground = require("./models/campground");
const review = require("./models/review");
const User = require("./models/user");

// Routes
const campgrounds = require("./routes/campsites");
const accounts = require("./routes/accounts.js");
const reviews = require("./routes/reviews.js");

// Utilities / helpers
const ExpressError = require("./utilities/ExpressError");
const { deleteDatabase } = require("./utilities/healperfunctions.js");
const { TryCatchWrap } = require("./utilities/healperfunctions");
const { randomizeMany } = require("./seeds/seedIndex");
const { isLoggedIn } = require("./utilities/middleware.js");

//session
const session = require("express-session");
const { includes } = require("./seeds/cities.js");
const { Script } = require("vm");

//mongo store for sessions
const MongoStore = require("connect-mongo");
const localStore = MongoStore.create({
  mongoUrl: dbURL,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: secret,
  },
  collectionName: "sessions",
});

localStore.on("error", function (e) {
  console.log("session store error", e);
});

const sessionConfig = {
  store: localStore,
  //dont use default name
  name: "yelpCampSession",
  //this should be a long unguessable string in production stored in .env file
  secret: secret,
  //use a different value for resave
  resave: false,
  saveUninitialized: true,
  //this will set cookie options like expiration
  cookie: {
    httpOnly: true,
    //secure: true, for production use HTTPS
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week from now unless browser is closed or refreshed etc...
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
  },
};
app.use(session(sessionConfig));

//passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//flash
app.use(connectFlash());
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.deleted = req.flash("deleted");
  res.locals.info = req.flash("info");
  res.locals.currentUser = req.user;
  next();
});

// Start the server
// MongoDB/Mongoose connection
async function database() {
  try {
    await mongoose.connect(dbURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected!");
    // Start the server only after DB is ready

    app.listen(port, "0.0.0.0", () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1); // stop process so it can be restarted by a process manager
  }
}
database();

app.get(
  "/",
  TryCatchWrap(async (req, res, next) => {
    const campgrounds = await campground.find({});
    res.render("home", { campgrounds, isLoggedIn });
  }),
);

// ROUTES
app.use("/campgrounds", campgrounds);
app.use("/", accounts);
app.use("/reviews", reviews);

/**
 * Catch-all route for undefined paths - returns 404 error
 */
// app.all(/(.*)/, (req, res, next) => {
//    next(new ExpressError('Page Not Found!', 404))
//  })

/**
 * Error handling middleware - renders error page with error details
 */
app.use((err, req, res, next) => {
  const { status = 500, message = "Sorry, something went wrong." } = err;
  const errTime = new Date();
  console.log(err, errTime.toLocaleString());
  console.dir(err.message, err.stack);

  req.flash("error", "Something went wrong!");
  //res.redirect('/campgrounds');
  res
    .status(status)
    .render("error", { errorMessage: message, errorStack: err.stack });
});
