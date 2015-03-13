'use strict';

var _              = require('lodash');
var Movie          = require('../models/movie');
var Rating         = require('../models/rating');
var Recommendation = require('../models/recommendation');


/**
 * Return all movies with similarity scores.
 * @param {Integer} userId User identifier
 * @return {Promise}
 */
function getScoredMovies () {
  return Recommendation
    .find({})
    .lean()
    .exec();
}

/**
 * Return all movies rated by a given user
 * @param {Integer} userId User identifier
 * @return {Promise}
 */
function getUserRatedMovies (userId) {
  return Rating
    .find({userId: userId})
    .select('movieId rating')
    .lean(true)
    .exec();
}

/**
 * Make recommendations for new movies based on movies a
 * given user has already seen.
 * @param {Object} userRated All the movies a user has rated.
 * @param {Object} scored Movies with similarity scores.
 * @param {Integer} howmany How many recommendations to return
 * @return {Object}
 */
function getRecommendedMovies (userRated, scored, howmany) {
  var ranking, rating, similar, similarity,
      scores = {},
      totalSimilar = {},
      rankings = [];

  // Iterate over all user rated movies
  _.forIn(userRated, function(movie) {
    rating = movie.rating;

    // Reduce all scored movies to only ones which are similar to
    // the current movie.
    similar = _.where(scored, {targetMovieId: movie.movieId});

    // Iterate over similar scored movies
    _.forIn(similar, function(other) {
      similarity = other.similarity;

      // Exclude movies which the user has rated themselves
      if (other.movieId !== movie.movieId) {

        // Weighted sum of rating and similarity
        scores[other.movieId] = scores[other.movieId] || 0;
        scores[other.movieId] += rating * similarity;

        // Sum of the similarities
        totalSimilar[other.movieId] = totalSimilar[other.movieId] || 0;
        totalSimilar[other.movieId] += similarity;
      }
    });
  });

  // Normalize the rankings by averaging by the weighted sum
  _.forIn(scores, function(value, movieId) {
    ranking = scores[movieId]/totalSimilar[movieId];
    if (isFinite(ranking)) {
      rankings.push({
        movieId: movieId,
        ranking: scores[movieId]/totalSimilar[movieId]
      });
    }
  });

  // Sort and order rankings
  return _.sortBy(rankings, 'ranking').reverse().splice(0, howmany);
}

// Get recommended movies for a given user
module.exports.list = function(req, res) {
  var userId = req.params.userId;
  Promise.all([getUserRatedMovies(userId), getScoredMovies()])
    .then(function(response) {
      console.log(getRecommendedMovies(response[0], response[1], 10));
      res.sendStatus(200);
    });
};
