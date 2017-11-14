express = require('express');

const HomeController = require('./controllers/home');

module.exports = function (app) {
    // Initializing route groups
    const apiRoutes = express.Router(),
        homeRoutes = express.Router();

    apiRoutes.use('/home', homeRoutes);

    // route to  home
    homeRoutes.get('/', HomeController.home);

// Set url for API group routes
    app.use('/api', apiRoutes);
};

