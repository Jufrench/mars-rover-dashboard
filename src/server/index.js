require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')
const { Map, merge, set } = require('immutable');

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))


let data_store = Map({
    rover: ''
});

const updateDataStore = (store, newState) => {
    data_store = store.merge(newState);
};

const cleanRoverObject = _arr => {
    const roversObj = {};
    
    _arr.forEach(roverItem => {
        delete roverItem.photo_manifest.max_sol;
        delete roverItem.photo_manifest.total_photos;
        delete roverItem.photo_manifest.photos;

        const roverName = roverItem.photo_manifest.name;
        roversObj[roverName.toLowerCase()] = roverItem.photo_manifest;

        // console.log(roverItem);
    });

    // _arr.forEach(roverItem => {
    //     const roverName = roverItem.photo_manifest.name;
    //     roversObj[roverName.toLowerCase()] = roverItem.photo_manifest
    // });


    return roversObj;
};

app.get('/apod', async (req, res) => {
    try {
        let image = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send({ image })
        // console.log('/////////////');
        // console.log('image of the day: ', image);
        // console.log('/////////////');
    } catch (err) {
        console.log('error:', err);
    }
});

app.get('/rover-data', async (req, res) => {
    // console.log('/// getting rover data ///');
    Promise.all([
        fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/curiosity?api_key=${process.env.API_KEY}`),
        fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/opportunity?api_key=${process.env.API_KEY}`),
        fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/spirit?api_key=${process.env.API_KEY}`)
    ]).then(responses => {
        return Promise.all(responses.map(resItem => {
            return resItem.json();
        }))
    }).then(data => {
        res.send(cleanRoverObject(data));
        // updateDataStore()
    }).catch(err => console.log(err));
});

app.post('/', (req, res) => {
    // console.log('////////////////////');
    // updateDataStore(data_store, { rover: req.body.rover })
    // console.log('data_store: ', data_store.toObject());
    // console.log('////////////////////');
    // res.send('Post Received!');
    // ================
    updateDataStore(data_store, req.body);
    res.send('Post Received!');
});

app.get('/image-data', async (req, res) => {
    // console.log('%cgetting rover images');
    // const _rover = data_store.toObject().rover;
    // try {
    //     let data = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${_rover}/photos?sol=1000&page=1&api_key=${process.env.API_KEY}`)
    //         .then(res => res.json())
    //     res.send(data);
    //     console.log('/////////')
    //     console.log('data_store: ', data_store.toObject());
    //     console.log(data.photos);
    // } catch (err) {
    //     console.log('error:', err);
    // }
    // ================
    const { rover, date } = data_store.toObject();
    try {
        let data = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?earth_date=${date}&page=1&api_key=${process.env.API_KEY}`)
            .then(res => res.json())

            const updated = data.photos.filter((item, index) => {
                if (index < 7) {
                    return item;
                }
            });

            data.photos = updated;
        res.send(data);
    } catch (err) {
        console.log('error:', err);
    }
});

app.listen(port, () => console.log(`Listening on port ${port}!`))