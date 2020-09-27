//include
const ejs = require('ejs')
const routes = require('./routes/routes')
const express = require('express')
const fileUpload = require('express-fileupload');

const app = express()
const path = require('path');

// app engine set
app.engine('.ejs', ejs.__express);
app.set('views',__dirname+'/views');

// req body
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended : false}))
app.use(fileUpload());

app.use(express.static(path.join(__dirname, 'public')));

// router
app.use('/', routes)

// node server
app.listen(3000, () => {
    console.log(`http://localhost:3000`)
})