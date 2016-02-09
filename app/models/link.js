var db = require('../config');
var Click = require('./click');
var crypto = require('crypto');
var Users_Links = require('./users_links.js');

var Link = db.Model.extend({
  tableName: 'urls',
  hasTimestamps: true,
  defaults: {
    visits: 0
  },
  clicks: function() {
    return this.hasMany(Click);
  },
  users_links: function() {
    return this.hasMany(Users_Links);
  },
  initialize: function() {
    this.on('creating', function(model, attrs, options) {
      console.log("Model : ", model);
      var shasum = crypto.createHash('sha1');
      shasum.update(model.get('url'));
      model.set('code', shasum.digest('hex').slice(0, 5));
    });
  }
});

module.exports = Link;
