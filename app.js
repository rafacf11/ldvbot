var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var mongoose = require('mongoose');

var schedule = require('node-schedule');
var User = require('./app/model/user');
var apiController = require('./app/controller/api');

var routes = require('./app/routes/index');
var users = require('./app/routes/users');
var webhooks = require('./app/routes/webhooks');
var alumnos = require('./app/routes/alumnos');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'app', 'views'));
app.set('view engine', 'jade');

mongoose.connect('mongodb://localhost/routes', function(err, res) {
  if(err) {
    console.log('ERROR: Conectando a la BD: ' + err);
  } else {
    console.log('Conexion a la BD realizada');  
  }
});

var j = schedule.scheduleJob('0 9 * * *', function(){

    User.find({}, function(err, users) {
        if (users != null) {
          apiController.getArticles(function(err, articles) {
            users.forEach(function(user){
              apiController.sendArticleMessage(user.fb_id, articles[0])
            });
          })
        }
    });
});

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'app', 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/webhook', webhooks);
app.use('/alumnos', alumnos);

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
