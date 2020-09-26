const express = require('express')
const router = express.Router()
let username = ""

// redis
const redis = require("redis");
const client = redis.createClient();
client.on("error", error => {
    console.error(error);
})


router.get('/', (req, res) => {
    res.render('index.ejs', {
        'title': 'FaceID ile Oturum Kontrolü'
    })
})

router.get('/new_face', (req, res) => {
    res.render('new_face.ejs', {
        'title': 'FaceID ile Oturum Kontrolü'
    })
})

router.get('/login_step1', (req, res) => {
    res.render('login_step1.ejs', {
        'title': 'FaceID ile Oturum Kontrolü'
    })
})

router.post('/login_step2', (req, res) => {
    username = req.body.username
    res.render('login_step2.ejs', {
        'title' : 'FaceID ile Oturum Kontrolü',
        'username' : req.body.username
    })
})

router.get('/success', (req, res) => {
    res.end('Giris Basarili :)')
})

router.post('/postImages', (req, res) => {
    client.set(username, req.body.data, (error, message) => {
        if (error) {
            console.error(error);
        }
    })
    // fs.writeFileSync(req.body.label + ".json", req.body.data); => dosya olarak kaydet
    return res.sendStatus(200);
})

router.post('/getImages', (req, res) => {
    client.get(username, (error, message) => {
        if (error) {
            console.error(error);
        }
        return res.end(message);
    })
})

module.exports = router