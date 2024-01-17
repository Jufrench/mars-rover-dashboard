// let store = {
//     activeRover: { name: "Student" },
//     apod: '',
//     rovers: ['Curiosity', 'Opportunity', 'Spirit'],
// }

let store = Immutable.Map({
    activeRover: { },
    rovers: Immutable.List(['curiosity', 'opportunity', 'spirit']),
    rovers_data: Immutable.Map({}),
    apod: {},
    images: Immutable.List([]),
    rovers_ready: false
});


// TODO: 
/**
 * set active rover after post/get so that the radio button will stay checked
 * push to github
 */


// ------------------------------------------------------  
// STORE MANAGEMENT -------------------------------------

// add our markup to the page
const root = document.getElementById('root');

const updateStore = (store, newState) => {
    // store = Object.assign(store, newState)
    // render(root, store)
    // const newStore = store.merge(newState);
    const newStore = store.merge(newState);
    render(root, newStore);

    // console.log('%cnewStore:', 'color: #0abab5', newStore.toObject());
};

// const setStoreData = (_state, _data) => {
//     console.log('_state:', _state);
//     console.log('_data:', _data);
//     store = store.set(_data);
// };

const setStoreData = (_state, _prop, _data) => {
    store = _state.set(_prop, _data);
    // const newStore = store.set(_prop, _data);

    render(root, store);

};

const render = async (root, state) => {
    console.log('%cRendering...', 'color: #ed4337');
    root.innerHTML = App(state);
};

{/* <h2 class="active-rover-title">
${Object.keys(stateObj.activeRover).length === 0 ? '' : stateObj.activeRover.toObject().name }
</h2> */}

const App = (state) => {
    let { activeRover, rovers, images, apod } = state.toObject();
    const stateObj = state.toObject();
    // console.log('%cstateObj:', 'color:orange', stateObj);
    console.log('%cObject.keys(stateObj.activeRover).length', 'color:orange', Object.keys(stateObj.activeRover).length);
    // <section class="bg rover-select-wrap>${Object.keys(stateObj.activeRover).length === 0 ? '' : RoverData(activeRover)}</section>
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
                    <div class="image-of-day" style="height: 400px; background-image: url(${ImageOfTheDay(apod)})">
                        <a href="${ImageOfTheDay(apod)}" target="_blank" class="click-full-photo">Click here to see full photo</a>
                    </div>
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
    // console.log('%cactivateSlickSlider:', 'color: gold', 'Activated');
    $('.images').slick({
        dots: true,
        slidesToShow: 1,
        variableWidth: true,
        prevArrow: '<button type="button" class="slick-prev"><i class="fas fa-arrow-left"></i></button>',
        nextArrow: '<button type="button" class="slick-next"><i class="fas fa-arrow-right"></i></button>'
    });
};

// const mutationSettings = () => {
//     const target = document.getElementById('root');
//     const config = { attributes: false, childList: true, subtree: true };

//     const callback = (mutationsList, observer) => {
//         for(const mutation of mutationsList) {
//             if (mutation.type === 'childList') {
//                 const nodes = mutation.addedNodes;
                
//                 for (let i = 0; i < nodes.length; i++) {
//                     if (nodes[i].classList !== undefined && 
//                         nodes[i].classList.contains('main')) {
//                         // activateSlickSlider();
//                     }
//                 }
//             }
//         }
//         observer.disconnect();
//     }

//     return {
//         target,
//         config,
//         callback
//     };
// };
// const settingsObj = mutationSettings();
// const observer = new MutationObserver(settingsObj.callback);

// ------------------------------------------------------ 
// COMPONENTS -------------------------------------------  

const RoversWrap = (_rovers) => {
    // return `
    //     <section class="rovers-wrap">
    //         ${_rovers.join('')}
    //     </section>
    // `
    return `${_rovers.join('')}`
};

const ActiveRover = (_state) => {
    console.log('--- _state ---', _state)
    return `
        <h2 class="active-rover-title">
        ${Object.keys(_state.activeRover).length === 0 ? '' : _state.activeRover.toObject().name}
        </h2>
    `
};

const RoverItem = (state, _rover) => {
    // const capitalized = _rover.charAt(0).toUpperCase() + _rover.slice(1);
    let activeRover = '';
    if (Object.keys(state.activeRover).length !== 0) {
        // console.log('RoverItem:', state.activeRover.toObject());
        activeRover = state.activeRover.toObject().name.toLowerCase();
    }

    const isChecked = (_state, __rover) => {
        let str = '';

        if (Object.keys(state.activeRover).length !== 0) {
            // console.log('RoverItem:', state.activeRover.toObject());
            str = state.activeRover.toObject().name.toLowerCase() === __rover ? __rover : '';
        }
        // console.log(str + ' is checked!');
        return str;
    }

    // return `
    //     <div class="rover-select">
    //         <input ${isChecked(state, _rover)} type="radio" id="radio-${_rover}" name="rover" />
    //         <label class="rover-select-label" for="radio-${_rover}" data-rover="${_rover}">${_rover}</label>
    //     </div>
    // `
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
    console.log('%c_images:', 'color:dodgerblue', _images)
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
    console.log('%c_apod', 'color:limegreen', _apod)
    // _apod = _apod.toObject();

        // If image does not already exist, or it is not from today -- request it again
        const today = new Date();
        const photodate = new Date(_apod.date);
        // console.log(photodate.getDate(), today.getDate());
        // console.log(photodate.getDate() === today.getDate());
        if (!_apod || _apod.date === today.getDate() ) {
            // console.log('before getImageOfTheDay:', store);
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
            // <img src="${_apod.url}" height="350px" width="100%" alt="Astrology photo of the day" />
            // <p>${_apod.explanation}</p>
            return (`
                ${_apod.url}
            `)
        }
    // }
};

// ------------------------------------------------------  
// API CALLS --------------------------------------------

const getImageOfTheDay = async (state) => {
    let { apod } = state;
    let data;
    
    try {
        fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(res => {
            // updateStore(store, { apod: res.image });
            console.log('%cgetImageOfTheDay', 'color: gold');
            // data = res.image;
            setStoreData(store, 'apod', res.image);
            // updateStore(store, { apod: res.image });
            // console.log('%cgetImageOfTheDay:', 'color: gold', res);
        });
    } catch (error) {
        console.error(error);
    }

    return data;
};

// const postRover = async (_rover) => {
//     // console.log('%cpost:', 'color: gold', _rover);

//     let fetchRes;
//     fetchRes = await fetch('http://localhost:3000', {
//         method: 'POST',
//         credentials: 'same-origin',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ rover: _rover }),
//     });

//     return fetchRes;
// };
// =============
const postRover = async (_roverObj) => {
    // console.log('%cpost:', 'color: gold', _rover);

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
        console.log('%cget images:', 'color: gold', data);

        // updateStore(store, { rovers_data: data });
    } catch (error) {
        console.error(error);
    }

    return data;
};

const roverInputsReady = (_state) => {
    setStoreData(store, 'rovers_ready', true);
    console.log('%croverInputsReady:', 'color: gold', 'Ready - Set State');
};

const getRoverData = async () => {
    let data;

    try {
        const fetchRes = await fetch('http://localhost:3000/rover-data').then(res => res.json());
        data = fetchRes;
        setStoreData(store, 'rovers_data', data);
        console.log('%csetStoreRoverData:', 'color: gold', 'Complete');
        roverInputsReady();
    } catch (error) {
        console.error(error);
    }

    return data;
};

// const httpRequests_then_updateStore = _rover => {
//     postRover(_rover)
//         .then(data => getRoverImages(data))
//         .then(image_data => image_data.photos.map(obj => obj.img_src))
//         .then(image_arr => {
//             const tempObj = {};

//             tempObj.images = image_arr;
//             tempObj.activeRover = setActiveRoverObject(_rover);
//             // console.log(tempObj);
//             // console.log(setActiveRoverObject(_rover));
//             return tempObj;
//         })
//         .then(_tempObj => updateStore(store, _tempObj))
//         .then(() => activateSlickSlider());
// };
// ========
const httpRequests_then_updateStore = _roverObj => {
    // console.log('_roverObj:', _roverObj);
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
    // observer.observe(settingsObj.target, settingsObj.config);
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
