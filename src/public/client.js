// App state
let store = Immutable.Map({
    user: Immutable.Map({ name: "Human" }),
    apod: '',
    roversNames: Immutable.List(['Curiosity', 'Opportunity', 'Spirit']),
    selectedRover: '',
    rovers: [],
    roversPhotos: new Map([ ['Curiosity', {}], ['Opportunity', {}], ['Spirit', {}] ])
})


const root = document.getElementById('root')
const render = async (root, state) => { root.innerHTML = App(state) }

//Update App state
const updateStore = (store, newState) => {
    debugger
    console.log("UPDATING STORE")
    store = store.merge(newState)
    render(root, store)
}


// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store);

    // Event Handler for rover selection
    root.onclick = event => {
        if (event.target.innerHTML == 'Show me!') {
            roverName = event.target.previousElementSibling.previousElementSibling.innerHTML;
            if (JSON.stringify(store.roversPhotos.get(roverName)) === '{}') getRoverPhotos(roverName);
            else updateStore(store, {'selectedRover': roverName});
        }

    }
})


//------------------------------------------------------ create content
const App = (state) => {
    debugger
    const apod = state.toJS().apod;

    return `
            <section>
                ${ImageOfTheDay(apod)}
                ${Rover(state)}
                ${state.toJS().selectedRover != '' ? showPhotos(state.toJS().selectedRover) : ''}
            </section>
        `
}

// ------------------------------------------------------  COMPONENTS

const Rover = (state) => {
    let rovers = state.toJS().rovers;
    let roversNames = state.toJS().roversNames;

    const dummyRoversImages = ["https://mars.nasa.gov/system/content_pages/main_images/374_mars2020-PIA21635.jpg",
                                "https://d2pn8kiwq2w21t.cloudfront.net/images/imagesmars202020180921PIA22109-16.width-1320.jpg",
                                "https://m.dw.com/image/54182462_401.jpg"];

    debugger
    if (rovers.length === 0 ) getRovers(roversNames);
    else {
        let content = ` <div class="row my-4">
                        <div class="col mx-auto text-center text-uppercase">
                            <h1 class="text-white">Choose the drone!</h1>
                        </div>
                    </div> `;

    
   
        rovers.forEach( (rover, index) => {
            content = content.concat( `
                <div class="col-lg-3 col-md-6 mx-auto my-5">
                    <div class="card text-center m-2">
                        <img src="${dummyRoversImages[index]}" class="card-img-top" alt="...">
                        <div class="card-body">
                            <h5 class="card-title">${rover.name}</h5>
                            <ul class="list-group list-group-flush">
                                <li class="list-group-item">Status: ${rover.status}</li>
                                <li class="list-group-item">Launch date: ${rover.launch_date}</li>
                                <li class="list-group-item">Landing date: ${rover.landing_date}</li>
                                <li class="list-group-item">Most recent photo: ${rover.photos.map(photoObj => photoObj.earth_date).reduce( (date, currentDate) => currentDate > date ? currentDate : date )}</li>
                                <li class="list-group-item">Total photos: ${rover.total_photos}</li>
                            </ul>
                            <a href="#" class="btn btn-primary mt-3">Show me!</a>
                        </div>
                    </div>
                </div> `
            )
        })

        return `<div class="row py-5">
                    ${content}
                </div>
                `
    }
    
}

// Show rover photos and details
const showPhotos = (state, roverName) => {
    debugger
    console.log('SHOW PHOTOS')
    let content = ``;

    state.roversPhotos.get(roverName).forEach( photo => {
        content = content.concat(`<div class="col-lg-3 col-md-5 col-sm-10 mx-auto rounded border">
                                        <img src="${photo}" class="img-fluid">
                                    </div>`);
    })
    
    return `<div class="container">
                <div class="row py-5 text-center">
                    <h2 class="text-white mb-4">${state.selectedRover}'s Photos</h2>
                    ${content}
                </div>
            </div>
            `
}


// Create showcase image
const ImageOfTheDay = (apod) => {

    const today = new Date()
    debugger
    if (!apod || apod.date === today.getDate() ) { // If image does not already exist, or it is not from today -- request it again
        getImageOfTheDay(store);
    } else {

        // check if the photo of the day is actually type video!
        if (apod.media_type === "video") {
            return (`
                <p>See today's featured video <a href="${apod.url}">here</a></p>
                <p>${apod.title}</p>
                <p>${apod.explanation}</p>
            `)
        } else {
            return (`
                <div class="row  text-white">
                    <div class="col-lg-6 col-md-9 mx-auto rounded">
                        <img src="${apod.image.url}" class="img-fluid" />
                    </div>

                    <div class="col-lg-6 col-md-9 text-center m-auto">
                        <h1 class="p-2">${apod.image.title}</h1>
                        <p class="my-5 p-2">${apod.image.explanation}</p>
                    </div>

                </div>
            `)
        }
    }
}

// ------------------------------------------------------  API CALLS

const getImageOfTheDay = (state) => {
    console.log('getImageOfTheDay')
    fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => updateStore(store, Immutable.Map( { apod } ) ) )
}


const getRovers = (roversNames) => {
    console.log('getRovers');
    let rovers = Immutable.List([]);
    
    Array.from(roversNames).forEach( (roverName, index, array) => {
        fetch(`http://localhost:3000/rover?name=${roverName}`)
            .then(res => res.json())
            .then(res => {
                console.log(res.rover.photo_manifest);
                rovers = rovers.push(res.rover.photo_manifest)
            })
            .then( () => index === array.length -1 ? updateStore(store,{ rovers }) : undefined)
    });

}


const getRoverPhotos = (roverName) => {
    console.log(`getRoverPhotos - roverName: ${roverName}`);
    fetch(`http://localhost:3000/rover-photos?name=${roverName}`)
        .then(res => res.json())
        .then(data =>  updateStore(store, { roversPhotos: new Map([ ['Curiosity', data.latest_photos.map(imgObj => imgObj.img_src)], ['Opportunity', {}], ['Spirit', {}] ]), selectedRover: roverName }) )
}