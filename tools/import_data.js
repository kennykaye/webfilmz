/**
 * Imports dataset to mongodb
 *
 * @author Kenny Kaye <Kenny Kaye>
 */
'use strict';

var lineReader = require('line-reader');
var Movie      = require('../app/models/movie');
var Rating     = require('../app/models/rating');

/**
 * Split a line by tabs
 * @param {String} line A line in a buffer.
 * @return {Array}
 */
function splitByTab (line) {
  return line.replace(/\r/, '').split(/\t/);
}

/**
 * Create movie schema for mongoose from array input.
 * @param {Array} array Array representation of movie data.
 * @return {Object} Object representing mongoose schema.
 */
function movieObjectFromArray (array) {
  return {
    id: array[0],
    title: array[1],
    year: array[5],
    imdb: {
      id: array[2],
      pictureUrl: array[4],
    },
    rottenTomatoes: {
      id: array[6],
      allCriticsRating: array[7],
      allCriticsNumReviews: array[8],
      allCriticsNumFresh: array[9],
      allCriticsNumRotten: array[10],
      allCriticsScore: array[11],
      topCriticsRating: array[12],
      topCriticsNumReviews: array[13],
      topCriticsNumFresh: array[14],
      topCriticsNumRotten: array[15],
      audienceRating: array[16],
      audienceNumRatings: array[17]
    }
  };
}

/**
 * Create rating schema for mongoose from array input.
 * @param {Array} array Array representation of rating data.
 * @return {Object} Object representing mongoose schema.
 */
function ratingObjectFromArray (array) {
  return {
    userId: array[0],
    movieId: array[1],
    rating: array[2],
    date: new Date(array[5], array[4], array[3], array[6], array[7], array[8])
  };
}

/**
 * Import ratings from dat source to database
 * @return {Promise}
 */
function importRatings () {
  return lineReader.eachLine(process.cwd() + '/data/user_ratedmovies.dat', function(line) {
    Rating.create(ratingObjectFromArray(splitByTab(line)), function(err, rating) {
      console.log('Saving: ' + rating);
      if (err) console.log(err);
    });
  });
}

/**
 * Import movies from dat source to database
 * @return {Promise}
 */
function importMovies () {
  lineReader.eachLine(process.cwd() + '/data/movies.dat', function(line) {
    Movie.create(movieObjectFromArray(splitByTab(line)), function(err, movie) {
      console.log('Saving: ' + movie);
      if (err) console.log(err);
    });
  });
}

module.exports = function () {
  Promise.all([importRatings(), importMovies()]).then(function() {
    console.log('Successfully imported ratings and movies');
  });
};
