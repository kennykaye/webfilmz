/**
 * A fictitious movie recommendation application
 *
 * @author Kenny Kaye <kenny@kaye.us>
 */
'use strict';

var express     = require('express');
var mongoose    = require('mongoose');
var morgan      = require('morgan');
var tools       = require('./tools/index');
var controllers = require('./app/controllers/index');
var app         = express();

mongoose.connect('mongodb://localhost/webfilmz');

// Mount middleware
app.use(morgan('dev'));

// Default routes
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

// Display routes
app.get('/movies', controllers.movies.list);
app.get('/recommendations/:userId', controllers.recommendations.list);

// Tools routes
app.get('/tools/import-data', tools.importData);
app.get('/tools/build-comparison', tools.buildComparison);

// Listen on port
app.listen('8337', function () {
  console.log('Webfilmz Server Connected at http://127.0.0.1:8337');
});
