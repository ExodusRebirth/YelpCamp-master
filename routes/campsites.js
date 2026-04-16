const express = require('express');


const { isLoggedIn, isAuthor, validateCampground, TryCatchWrap, validateReqBody } = require('../utilities/middleware');

const router = express.Router({ mergeParams: true });



const campgroundControllers = require('../controllers/campgrounds')

//multer for files uploads


const multer = require('multer');
const {storage} = require('../cloudinary')

const upload = multer({ storage })







router.route('/')

 .get (TryCatchWrap(campgroundControllers.allCampgrounds))
 .post(isLoggedIn, upload.array('newimages'), validateCampground, TryCatchWrap(campgroundControllers.postNewCampground))

   
 


//Make campground form - renders the form to create a new campground
router.get('/new', isLoggedIn, campgroundControllers.newCampground)

router.get('/:id/edit', isLoggedIn, isAuthor, TryCatchWrap(campgroundControllers.editCampground))

//View specific campground - renders details for a single campground
router.get('/:id', TryCatchWrap(campgroundControllers.viewCampground))





//Update campground - handles PUT request to update campground details

router.put('/:id', isLoggedIn, isAuthor, upload.array('images'), TryCatchWrap(campgroundControllers.postEditCampground))


//Delete campground - handles DELETE request to remove a campground

router.delete('/:id', isLoggedIn, isAuthor, TryCatchWrap(campgroundControllers.DeleteCampground))

router.delete('/:id/edit/:imageID', isLoggedIn, isAuthor, TryCatchWrap(campgroundControllers.DeleteCampImage))


module.exports = router;

