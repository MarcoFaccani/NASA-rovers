// ============ SETUP ============
require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

app.listen(port, () => console.log(`listening on port ${port}!`))

// ============ API calls ============

// Get picture of the day
app.get('/apod', async (req, res) => {
    try {
        const image = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send({ image })
    } catch (err) {
        console.log('error:', err);
    }
})

// Get rover by name
app.get('/rover', async (req, res) => {
    try {
        console.log(`BE parameter = ${req.query.name}`);
        const rover = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${req.query.name}?api_key=${process.env.API_KEY}`)
                            .then(res => res.json())
        res.send({ rover }) //send to caller (FE)

    } catch(err) {
        console.log('error:', err);
    }

})

