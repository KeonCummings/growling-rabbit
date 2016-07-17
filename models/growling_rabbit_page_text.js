var mongoose = require('mongoose');
var Schema       = mongoose.Schema;	
var pageSchema   = new Schema({
    homePage: String,
    communityPage: String,
    eventPage: String,
    contactPage: String,
    galleryPage: String });

module.exports = mongoose.model('Page', pageSchema);;