var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var Users_Links = require('./users_links.js');

var User = db.Model.extend({
  tableName: 'users',
  name: 'name',
  password: 'password',
  users_links: function() {
    return this.hasMany(Users_Links);
  },
});


module.exports = User;