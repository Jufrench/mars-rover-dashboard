let store = Immutable.Map({
    activeRover: {},
    rovers: Immutable.List(['curiosity', 'opportunity', 'spirit']),
    rovers_data: Immutable.Map({}),
    apod: {},
    images: Immutable.List([]),
    rovers_ready: false
});

// ------------------------------------------------------  
// STORE MANAGEMENT -------------------------------------
const root = document.getElementById('root');

const updateStore = (store, newState) => {
    const newStore = store.merge(newState);
    render(root, newStore);
};

const setStoreData = (_state, _prop, _data) => {
    store = _state.set(_prop, _data);
    render(root, store);
};

const render = async (root, state) => {
    root.innerHTML = App(state);
};

const App = (state) => {
    let { activeRover, rovers, images, apod } = state.toObject();
    const stateObj = state.toObject();

    return `
        <header class="bg box header">
            <h1>Mars Rovers Dashboard</h1>
            <p>(Select a rover to get rover data & images)</p>
        </header>
        <main class="main ${stateObj.rovers_ready === true ? 'rovers-ready' : ''}">
            <section class="rover-select-wrap">
                ${RoversWrap(rovers.toArray().map(rover => RoverItem(stateObj, rover)))}
            </section>
            ${Object.keys(stateObj.activeRover).length === 0 ? '' :
                `<section class="bg box active-rover-wrap">
                    ${ActiveRover(stateObj)}
                </section>`
            }
            <section>
                ${Object.keys(stateObj.activeRover).length === 0 ? '' : RoverData(activeRover)}
                ${images.toArray().length === 0 ? '' :
                    `<div class="rover-images">
                        ${ImagesWrap(images.toArray().map(image => Image(image)))}
                    </div>`
                }
            </section>
            ${Object.keys(state.toObject().apod).length === 0 ?
                '<p style="text-align: center">Loading apod...</p>' :
                `<section>
                    <!-- ImageOfTheDay(apod) -->
                    <p class="bg box">Image of the day</p>
                    <div class="image-of-day" style="height: 300px; background-image: url(${ImageOfTheDay(apod)})">
                        <a href="${ImageOfTheDay(apod)}" target="_blank" class="click-full-photo">Click here to see full photo</a>
                    </div>
                    <p>${apod.explanation}</p>
                </section>`
            }
        </main>
    `
};

const setActiveRoverObject = (_rover) => {
    let activeRover = {};
    const rovers = store.toObject().rovers_data;

    for (const prop in rovers) {
        if (_rover === prop) {
            activeRover = rovers[prop];
        }
    }

    return activeRover;
};

const rover_and_maxDate = (_rover) => {
    const tempObj = {};
    const rovers_data = store.toObject().rovers_data;

    for (const prop in rovers_data) {
        if (_rover === prop) {
            tempObj.rover = prop;
            tempObj.date = rovers_data[prop].max_date;
        }
    }

    return tempObj;
};

const activateSlickSlider = () => {
    $('.images').slick({
        dots: true,
        slidesToShow: 1,
        variableWidth: true,
        prevArrow: '<button type="button" class="slick-prev"><i class="fas fa-arrow-left"></i></button>',
        nextArrow: '<button type="button" class="slick-next"><i class="fas fa-arrow-right"></i></button>'
    });
};

// ------------------------------------------------------ 
// COMPONENTS -------------------------------------------  

const RoversWrap = (_rovers) => `${_rovers.join('')}`;

const ActiveRover = (_state) => {
    return `
        <h2 class="active-rover-title">
            ${Object.keys(_state.activeRover).length === 0 ? '' : _state.activeRover.toObject().name}
        </h2>
    `
};

const RoverItem = (state, _rover) => {
    let activeRover = '';
    if (Object.keys(state.activeRover).length !== 0) {
        activeRover = state.activeRover.toObject().name.toLowerCase();
    }

    return `
        <div class="rover-select">
            <input ${activeRover === _rover ? 'checked' : ''} type="radio" id="radio-${_rover}" name="rover" />
            <label class="bg rover-select-label" for="radio-${_rover}" data-rover="${_rover}">${_rover}</label>
        </div>
    `
};

const RoverData = (_rover) => {
    _rover = _rover.toObject();
    return `
            <ul class="rover-data bg box">
                <li><span class="title">Launch Date:</span> <span class="stat">${_rover.launch_date}</span></li>
                <li><span class="title">Landing Date:</span> <span class="stat">${_rover.landing_date}</span></li>
                <li><span class="title">Status:</span> <span class="stat">${_rover.status}</span></li>
                <li><span class="title">Most Recent Photo Date:</span> <span class="stat">${_rover.max_date}</span></li>
            </ul>
    `
};

const ImagesWrap = (_images) => {
    return `
        <div class="images">${_images.join('')}</div>
    `
};

const Image = (_image) => {
    return `
        <img src="${_image}" />
    `
};

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (_apod) => {
    // If image does not already exist, or it is not from today -- request it again
    const today = new Date();

    if (!_apod || _apod.date === today.getDate() ) {
        getImageOfTheDay(store);
    }

    if (_apod.hasOwnProperty('error')) {
        return (`
            <p style="text-align: center"><span style="color:red">Error: </span><span>${_apod.error.message}</span></p>
        `)
    }

    // check if the photo of the day is actually type video!
    if (_apod.media_type === "video") {
        return (`
            <p>See today's featured video <a href="${_apod.url}">here</a></p>
            <p>${_apod.title}</p>
            <p>${_apod.explanation}</p>
        `)
    } else {
        return (`${_apod.url}`)
    }
};

// ------------------------------------------------------  
// API CALLS --------------------------------------------

const getImageOfTheDay = async (state) => {
    let data;
    
    try {
        fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(res => {
            setStoreData(store, 'apod', res.image);
        });
    } catch (error) {
        console.error(error);
    }

    return data;
};

const postRover = async (_roverObj) => {
    let fetchRes;
    fetchRes = await fetch('http://localhost:3000', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(_roverObj),
    });

    return fetchRes;
};

const getRoverImages = async () => {
    let data;

    try {
        const fetchRes = await fetch('http://localhost:3000/image-data').then(res => res.json());
        data = fetchRes;
    } catch (error) {
        console.error(error);
    }

    return data;
};

const roverInputsReady = (_state) => {
    setStoreData(store, 'rovers_ready', true);
};

const getRoverData = async () => {
    let data;

    try {
        const fetchRes = await fetch('http://localhost:3000/rover-data').then(res => res.json());
        data = fetchRes;
        setStoreData(store, 'rovers_data', data);
        roverInputsReady();
    } catch (error) {
        console.error(error);
    }

    return data;
};

const httpRequests_then_updateStore = _roverObj => {
    postRover(_roverObj)
        .then(data => getRoverImages(data))
        .then(image_data => image_data.photos.map(obj => obj.img_src))
        .then(image_arr => {
            const tempObj = {};

            tempObj.images = image_arr;
            tempObj.activeRover = setActiveRoverObject(_roverObj.rover);

            return tempObj;
        })
        .then(_tempObj => updateStore(store, _tempObj))
        .then(() => activateSlickSlider());
};

// ------------------------------------------------------  
// EVENT LISTENERS --------------------------------------

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    getRoverData();
    getImageOfTheDay(store);
    render(root, store);
});

document.getElementById('body').addEventListener('click', e => {
    // * Rover Selection Input Label
    if (e.target.classList.contains('rover-select-label')) {
        const rover = e.target.dataset.rover;
        httpRequests_then_updateStore(rover_and_maxDate(rover));
    }
});
