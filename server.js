// Include the Node HTTP libraryvar http = require('http');// Include the Express modulevar express = require('express');// Create an instance of Expressvar app = module.exports.app = exports.app = express();// Include the responseTime modulevar responseTime = require('response-time')// Include the responseTime modulevar errorhandler = require('errorhandler')var mongoose = require('mongoose');var session = require('express-session');var bodyParser = require('body-parser');app.use(bodyParser.json()); // support json encoded bodiesapp.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies// Where to find the view filesapp.set('views', './views');app.engine('html', require('ejs').renderFile);app.use(express.static('./app'));app.use(express.static('./build'));app.use(express.static('./node_modules'));app.use(responseTime());app.use(session({resave: true, saveUninitialized: true, secret: 'SOMERANDOMSECRETHERE', cookie: { maxAge: 60000 }}));// Add the errorHander middlewareapp.use(errorhandler());var models = require('./server_app/models');var helpers = require('./server_app/helpers');var routes = require('./server_app/routes')(app, helpers);mongoose.set('debug', true);mongoose.connect('mongodb://localhost:27017/brmodeloDB', function (err) {  if (err) throw err;  app.listen(3000, function () {    console.log('now listening on http://localhost:3000');  })})