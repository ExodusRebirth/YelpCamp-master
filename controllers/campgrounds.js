const { cloudinary } = require('../cloudinary');
const campground = require('../models/campground');
const Campground = require('../models/campground');
const mongoose = require('mongoose')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })

var ID = function () {
    return '_' + Math.random().toString(36).substr(2, 9);
};

module.exports.allCampgrounds = async (req, res, next) => {
    const campground = await Campground.find({});
    res.render('campgrounds', { campground })
}

module.exports.newCampground = (req, res) => {
    res.render('makecampground')
    console.log()
}

module.exports.editCampground = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgroundsedit', { campground })
}

module.exports.viewCampground = async (req, res, next) => {
    
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
        
    }).populate('author');
    

    if (!campground) {
        req.flash('error', 'Cannot find that!');
        return res.redirect('/campgrounds');
    }

    res.render('viewcampground', { campground })
}

module.exports.postNewCampground = async (req, res) => {

    
    const geodata = await geocoder.forwardGeocode({
        query: req.body.campground.city + ' ' + req.body.campground.state,
        limit: 1
    }).send()

    console.log(geodata.body.features[0].geometry)

    const newCampground = new Campground(req.body.campground);
    newCampground.author = req.user._id;
    newCampground.geometry = geodata.body.features[0].geometry
    newCampground.images = req.files.map(file => ({

        url: file.path,
        filename: file.filename

    }))
    if(newCampground.images.length === 0){
        newCampground.images.push({ url: `https://imgs.search.brave.com/lut-MwPq__eSjxO4W1qFXGAB_9qvqXs1XNg4yXh2KVE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/ZnJlZS1waG90by90/ZW50LWNhbXBzaXRl/LXdvb2RzXzUzODc2/LTE1MzQ0Mi5qcGc_/c2VtdD1haXNfaW5j/b21pbmcmdz03NDAm/cT04MA`, filename: `${ID()}` })
    }
    await newCampground.save();
    
    req.flash('success', 'Successfully made a new campground!')
    res.redirect('/campgrounds')
}

module.exports.postEditCampground = async (req, res) => {
    const { id } = req.params;

    const { sitename, price, city, state, description } = req.body;

    const newCampground = await Campground.findByIdAndUpdate(id, {

        sitename: sitename,
        price: price,
        city: city,
        state: state,
        description: description,
    }, { new: true, runValidators: true })

    const newImages = req.files.map(file => ({
        url: file.path,
        filename: file.filename
    }));


   

    newCampground.images.push(...newImages)
    await newCampground.save();



    if (req.body.deletedImages) {

        //mongo find and pull
        await newCampground.updateOne({ $pull: { images: { filename: { $in: req.body.deletedImages } } } })

        //cloudinary find and pull
        if (newCampground.images.length !== 0) {
            newCampground.images.forEach((img, i) => {
                for (let index = 0; index <= req.body.deletedImages.length; ++index) {
                    if (img.filename === req.body.deletedImages[index]) {
                        cloudinary.uploader.destroy(img.filename)
                    }
                }
            });
        }
        req.flash('success', 'Successfully updated campground!')
        return res.redirect(`/campgrounds/${id}`)

    }
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${id}`)
}

module.exports.DeleteCampground = async (req, res) => {
    const { id } = req.params;
    console.log(req.params)
    const campground = await Campground.findById(id);
    campground.images.forEach(img => {
        cloudinary.uploader.destroy(img.filename)
    });
    await Campground.findByIdAndDelete(id);



    req.flash('deleted', 'Successfully deleted campground')
    res.redirect('/campgrounds')
}