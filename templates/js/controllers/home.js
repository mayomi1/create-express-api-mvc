const Main = require('../models/main'); // import your models

home = (req, res) => {
    return res.json('working');
};


module.exports = {
    home,
};