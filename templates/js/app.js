const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

const router = require('./router');
const config = require('./config/main');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

mongoose.Promise = require('bluebird');
mongoose.connect(config.database, { useMongoClient: true })
    .catch(err => console.error(err));

app.use(morgan('dev')); // log every request to the console

app.use(cors());

//launch ============================
app.listen(config.port);
console.log('Your server is running on ' + config.port);


router(app);