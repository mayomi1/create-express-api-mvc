const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

//================================
// home Schema
//================================
const HomeSchema = new Schema({
    home: {
        type: String
    }
});


module.exports = mongoose.model('home', HomeSchema);
