const express = require('express');
const app = express()
const router = express.Router();
const video = require('./video');
const cast = require('./cast');
const user = require('./user');
const director = require('./director');
const actor = require('./actors');
const bodyParser = require('body-parser')
app.use(bodyParser.json());


app.use('/', video);
app.use('/', cast);
app.use('/', user);
app.use('/', director);
app.use('/', actor);

app.listen(3001, () => { console.log('Server is running') })



