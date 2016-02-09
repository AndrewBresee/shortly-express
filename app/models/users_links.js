var db = require('../config');
var Link = require('./link.js');
var User = require('./user.js');

var Users_Links = db.Model.extend({
  tableName: 'users_links',
  link: function() {
    return this.belongsTo(Link, 'linkId');
  },
  user: function() {
    return this.belongsTo(User, 'userId');
  }
});

module.exports = Users_Links;
