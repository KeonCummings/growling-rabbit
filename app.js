var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer  =   require('multer');        
var routes = require('./routes/index');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); 
var mongoose = require('mongoose');
var db = mongoose.connection;
mongoose.connect('mongodb://localhost/growlingRabbit');
var Page = require('./models/growling_rabbit_page_text.js');
var User   = require('./models/user'); // get our mongoose model

var app = express();
var appAuth = express.Router()
var fs = require('fs');


// var dir = './uploads'; // your directory

// var files = fs.readdirSync(dir);
// files.sort(function(a, b) {
//                return fs.statSync(dir + a).mtime.getTime() - 
//                       fs.statSync(dir + b).mtime.getTime();
//            });



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('superSecret', config.secret);

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

appAuth.get('/setup', function(req, res) {

  // create a sample user
  var nick = new User({ 
    name: 'Nick Cerminara', 
    password: 'password',
    admin: true 
  });

  // save the sample user
  nick.save(function(err) {
    if (err) throw err;

    console.log('User saved successfully');
    res.json({ success: true });
  });
});


appAuth.use(function(req, res, next) {


  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {      
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });    
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;    
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({ 
        success: false, 
        message: 'No token provided.' 
    });
    
  }
});

appAuth.post('/authenticate', function(req, res) {
  //This post request finda random user and checks wheter or not the user is in the database
  //If the user is in the database then access is granted, if not access is not granted

  // find the user
  User.findOne({
    name: req.body.name
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {

      // check if password matches
      if (user.password != req.body.password) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {

        // if user is found and password is right
        // create a token
        var token = jwt.sign(user, app.get('superSecret'), {
          expiresIn: 1440 // expires in 24 hours
        });

        // return the information including token as JSON
        res.json({
          success: true,
          message: 'Enjoy your token!',
          token: token
        });
      }   

    }

  });
});


appAuth.get('/admin', function(req, res){
  res.json({ success: true, message: 'we are here' })
})


var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads');
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now() + ".png");
  }
});
var upload = multer({ storage : storage}).single('userPhoto');

app.post('/api/photo',function(req,res){
    upload(req,res,function(err) {
        if(err) {
            return res.end("Error uploading file.");
        }
        res.end("File is uploaded");
    });
});

app.post('/api/text',function(req,res){
    var text = new Page();     
        text.homePage = req.body.homePage;  

        text.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'Text Added!' });
        });
        
});

app.put('/:id', function(req, res, next) {
  Page.findByIdAndUpdate(req.params.id, { $set: req.body }, function (err, page) {
    if (err) return next(err);
    res.json(page);
  });
});

app.use('/auth', appAuth);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


module.exports = app;
