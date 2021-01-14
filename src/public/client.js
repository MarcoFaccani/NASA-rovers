let store = {
    user: { name: "Human" },
    apod: '',
    roversNames: ['Curiosity', 'Opportunity', 'Spirit'],
    rovers: [],
    isRoverSelected : false,
    selectedRoverName: ''
}


const root = document.getElementById('root')

const updateStore = (store, newState) => {
    console.log("UPDATING STORE")
    store = Object.assign(store, newState)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})


//------------------------------------------ create content
const App = (state) => {
    let { rovers, apod } = state

    if (!state.isRoverSelected) {
        return `
            <section>
                ${ImageOfTheDay(apod)}
                ${Rover(state)}
            </section>
        `
    } else {
        return `
            <section>

            </section>
        `
    }

    
}

// ------------------------------------------------------  COMPONENTS

const Rover = (state) => {
    let { rovers, roversNames} = state

    const dummyRoversImages = ["https://mars.nasa.gov/system/content_pages/main_images/374_mars2020-PIA21635.jpg",
                                "https://d2pn8kiwq2w21t.cloudfront.net/images/imagesmars202020180921PIA22109-16.width-1320.jpg",
                                "https://m.dw.com/image/54182462_401.jpg"];

    if (rovers.length === 0 ) getRovers(roversNames);

    let content = ` <div class="row my-4">
                        <div class="col mx-auto text-center text-uppercase">
                            <h1>Choose the drone!</h1>
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
                            <li class="list-group-item">Total photos: ${rover.total_photos}</li>
                        </ul>
                        <a href="#" class="btn btn-primary mt-3">Show me!</a>
                    </div>
                </div>
            </div> `
        )
     })

    return `<div class="row">
                ${content}
            </div>
            `
}

// Show rover photos and details
const ShowRover = (rover) => {



}


// Create showcase image
const ImageOfTheDay = (apod) => {

    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    const photodate = new Date(apod.date)
    console.log(photodate.getDate(), today.getDate());

    console.log(photodate.getDate() === today.getDate());
    if (!apod || apod.date === today.getDate() ) {
        getImageOfTheDay(store)
    }

    // check if the photo of the day is actually type video!
    if (apod.media_type === "video") {
        return (`
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `)
    } else {
        return (`
            <img src="${apod.image.url}" height="350px" width="100%" />
            <p>${apod.image.explanation}</p>
        `)
    }
}

// ------------------------------------------------------  API CALLS

const getImageOfTheDay = (state) => {
    let { apod } = state

    fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => updateStore(store, { apod }))
}


const getRovers = (roversNames) => {
    const rovers = [];
    
    Array.from(roversNames).forEach( (roverName, index, array) => {
        fetch(`http://localhost:3000/rover?name=${roverName}`)
            .then(res => res.json())
            .then(res => {
                console.log(res.rover.photo_manifest);
                rovers.push(res.rover.photo_manifest)
            })
            .then( () => index === array.length -1 ? updateStore(store, { rovers }) : undefined)
    });

}


const getRoverPhotos = (roverName) => {
    fetch(`http://localhost:3000/rover-photos?name=${roverName}`)
        .then(res => res.json())
        .then(res => {
            console.log(res);
        })

}
