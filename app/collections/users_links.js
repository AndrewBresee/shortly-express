var db = require('../config');
var Users_Links = require('../models/users_links');


var Users_Linkses = new db.Collection();

Users_linkses.model = Users_Links;

module.exports = Users_Linkses;
