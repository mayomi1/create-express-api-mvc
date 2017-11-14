const Main = require('../models/main');
home = (req, res) => {
    return res.json('working');
};


module.exports = {
    home,
};