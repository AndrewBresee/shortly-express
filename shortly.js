//**TODO**
//Only display links that that user has added
//Not nav to login when loged in
//Logout set sess to null, display all or none of the links
//When entering links, save to users_links

//Display username on page



var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bcrypt = require('bcrypt-nodejs');

var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var app = express();

var sess = null; 

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
var SessionStore = require('express-mysql-session');

// app.use(cookieParser());

app.use(session({
  secret: 'keyboard cat',
  expire: false
  // resave: false,
  // saveUninitialized: true,
  // cookie: { secure: true }
}));

// ***Make an authentication check using restrict***
function restrict(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.session.error = 'Access denied!';
    res.redirect('/login');
  }
}

app.get('/login', function(request, response) {
  response.render('login');
});

app.get('/signup', function(request, response) {
  response.render('signup');
});

// app.post('/login', function(request, response) {
 
//     var username = request.body.username;
//     var password = request.body.password;
 
//     if(username == 'demo' && password == 'demo'){
//         request.session.regenerate(function(){
//         request.session.user = username;
//         response.redirect('/restricted');
//         });
//     }
//     else {
//        res.redirect('login');
//     }    
// });


app.get('/logout', function(request, response){
    request.session.destroy(function(){
        response.redirect('/');
    });
});
 
app.get('/restricted', restrict, function(request, response){
  response.send('This is the restricted area! Hello ' + request.session.user + '! click <a href="/logout">here to logout</a>');
});
 



//Gets called when user clicks and navigates back to page. 
app.get('/', 
function(req, res) {
  console.log("GOT A GET REQUEST FROM /!!");
  res.render('index');
});

app.get('/login', function(request, response) {
  res.render('login');
});

app.get('/create', 
function(req, res) {
  console.log("GOT A GET REQUEST FROM CREATE!!");
  res.render('index');
});

app.get('/links', 
function(req, res) {
   console.log("GOT A GET REQUEST FROM LINKS!!");
  Links.reset().fetch().then(function(links) {
    res.send(200, links.models);
  });
});


app.post('/links', 
function(req, res) {
  console.log("req.session : ", req.session);
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        Links.create({
          url: uri,
          title: title,
          baseUrl: req.headers.origin
        })
        .then(function(newLink) {
          res.send(200, newLink);
        });
      });
    }
  });
});

app.post('/signup', 
  function(req,res){
    var username = req.body.username;
    var password = bcrypt.hashSync(req.body.password);
    new User({name: username}).fetch().then(function(found){
      if(found){
        res.redirect('signup');
        res.send(200, found.attributes);
        //TODO: Append error. 
      } else {
        Users.create({
          name: username,
          password: password
        });
        req.session.regenerate(function(err){
            if(err){
              console.log(err); 
            }
          });
          req.session.user = username;  
          console.log("req.session.user : ", req.session.user);
        //Investigate
        res.redirect('index');
      }
    }); 
  }
);

app.post('/login', 
  function(req,res){
    var username = req.body.username;
    var password = req.body.password;

    //Make this look at username.  
    User.where('name', username).fetch().then(function(user){
      var storedPassword = user.attributes.password;
      bcrypt.compare(password, storedPassword, function(err, match){
        if(match){
          req.session.regenerate(function(err){
            if(err){
              console.log(err); 
            }
          }); 
          req.session.user = username; 
          console.log("req.session : ", req.session);
          res.redirect('index');   
        } else {
          console.log("WRONG!");
          //res.redirect('signup');
          res.send(309);
        }
      });
    }).catch(function(err){
      console.log(err);
    });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/



/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        linkId: link.get('id')
      });

      click.save().then(function() {
        link.set('visits', link.get('visits') + 1);
        link.save().then(function() {
          return res.redirect(link.get('url'));
        });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);
