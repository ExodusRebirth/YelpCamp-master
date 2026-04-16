const express = require('express');
const app = express();
const loremipsum = require('lorem-ipsum').LoremIpsum;
const path = require('path')
const mongoose = require('mongoose');
const campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors, secoundaryDiscriptors } = require('./seedhelpers');
const port = 3000;
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })
const dbURL = process.env.MONGOPASS;
const lorem = new loremipsum({

    sentencesPerParagraph: {
        max: 18,
        min: 10
    },
    wordsPerSentence: {
        max: 16,
        min: 4
    }
});


app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

database().then(() => { mongoose.connection.close, console.log('Seed Database closed connection!') }).catch(err => console.log(err))
async function database() {
    try {
        (await mongoose.connect(dbURL)); {
            console.log('MongoDB connected for Seeding!');
        }
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1); // stop process so it can be restarted by a process manager
    }
}


const randomCity = function () { return cities[randomize(0, cities.length - 1)] }
const randomize = function (min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
var ID = function () {
    return '_' + Math.random().toString(36).substr(2, 9);
};


const randomizeMany = async function (numberOfSites) {
    for (let i = 0; i < numberOfSites; ++i) {

        newrandomcity = randomCity();

        const geodata = await geocoder.forwardGeocode({
            query: newrandomcity.city + ',' + newrandomcity.state,
            limit: 1
        }).send()

        const newCampground = new campground({


            city: newrandomcity.city,
            state: newrandomcity.state,
            sitename: descriptors[randomize(0, descriptors.length - 1)] + ' ' + secoundaryDiscriptors[randomize(0, secoundaryDiscriptors.length - 1)] + ' ' + places[randomize(0, places.length - 1)],
            price: randomize(1, 100) + .00,

            description: lorem.generateWords(25),
            author: '68eaf44d37c351729df78d09'
        })

        newCampground.images.push({ url: `https://picsum.photos/700/700?random=${Math.random()}`, filename: `${ID()}` }),
            newCampground.images.push({ url: `https://picsum.photos/700/700?random=${Math.random()}`, filename: `${ID()}` }),
            newCampground.images.push({ url: `https://picsum.photos/700/700?random=${Math.random()}`, filename: `${ID()}` }),
            newCampground.images.push({ url: `https://picsum.photos/700/700?random=${Math.random()}`, filename: `${ID()}` }),
            newCampground.images.push({ url: `https://picsum.photos/700/700?random=${Math.random()}`, filename: `${ID()}` }),
            newCampground.geometry = geodata.body.features[0].geometry;
        newCampground.images = campground.forEach((image, i) => ({

            url: newCampground.images[i].url,
            filename: newCampground.images[i].filename

        }))


        newCampground.save()
    }
}
module.exports = { randomizeMany }


