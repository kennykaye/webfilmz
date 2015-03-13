'use strict';

var _              = require('lodash');
var math           = require('mathjs');
var Rating         = require('../app/models/rating');
var Recommendation = require('../app/models/recommendation');

/**
 * Calculate the sum of all the array elements.
 * @param {Array} array Array to operate on.
 * @return {Integer}
 */
function arraySum (array) {
  return array.reduce(function(a, b) { return a + b; });
}

/**
 * Calculate the sum of the products of the elements of two arrays.
 * @param {Array} x First array.
 * @param {Array} y Second array.
 * @return {Integer}
 */
function arraySumProducts(x, y) {
  var sum = 0;
  x.forEach(function(value, index) {
    sum += x[index] * y[index];
  });
  return sum;
}

/**
 * Find the sum of the squares of an arrays elements
 * @param {Array} array Array whose items to operate on.
 * @return {Integer}
 */
function arraySumSquares(array) {
  var sum = 0,
      mean = math.mean(array);
  array.forEach(function(value) {
   sum += math.pow((value - mean), 2);
  });
  return sum;
}

/**
 * Find the intersection of the items in each dataset being compared.
 * @param {Object} prefs The formatted dataset containing information
 *                       about both items that are being compared.
 * @param {String|Integer} x Identifier for item one.
 * @param {String|Integer} y Identifier for item two.
 * @return {Array}
 */
function dataIntersection (prefs, x, y) {
  return _.intersection(_.keysIn(prefs[x]), _.keysIn(prefs[y]));
}

/**
 * Get array of values for specific keys in an object.
 * @param {Object} object Object in which to pick values from.
 * @param {Array} keys Keys whose value to pick.
 * @return {Array} Values for every specified key.
 */
function valuesAsArray (object, keys) {
  var values = [];
  keys.forEach(function(key) {
    values.push(object[key]);
  });
  return values;
}

/**
 * Calculate the person correlation score between two items in a dataset.
 *
 * @param {Object} prefs The dataset containing information about both items
 *                 that are being compared.
 * @param {String|Integer} x Key for item one.
 * @param {String|Integer} y Key for item two.
 * @return {Float} The pearson correlation score.
 */
function pearsonCorrelation (prefs, x, y) {
  var arrayX, arrayY, sumX, sumY, sumXsq, sumYsq, numerator, denominator,
      mutual = dataIntersection(prefs, x, y),
      n = mutual.length;

  // No correlation if no mutual items
  if (n === 0) return 0;

  arrayX = valuesAsArray(prefs[x], mutual);
  arrayY = valuesAsArray(prefs[y], mutual);
  sumX = arraySum(arrayX);
  sumY = arraySum(arrayY);
  sumXsq = arraySumSquares(arrayX);
  sumYsq = arraySumSquares(arrayY);
  numerator = arraySumProducts(arrayX, arrayY) - (sumX * sumY/n);
  denominator = math.sqrt( sumXsq * sumYsq );

  // Return Pearson correlation
  return denominator === 0 ? 0 : (numerator/denominator).toFixed(2);
}

/**
 * Store recommendations for all items.
 * @param {Object} prefs Formatted dataset to build comparisons for.
 * @return {Null}
 */
function buildMovieComparison (prefs) {
  var recSchema, score;
  _.forIn(prefs, function(x, movieX) {
    _.forIn(prefs, function(y, movieY) {
      score = pearsonCorrelation(prefs, movieX, movieY);
      if(score !== 0) {
        recSchema = {
          movieId: movieX,
          similarity: score,
          targetMovieId: movieY
        };
        console.log(recSchema);
        if (movieX !== movieY) {
          Recommendation.create(recSchema, function(err, recommendation) {
            console.log('Saving: ' + recommendation);
            if (err) console.log(err);
          });
        }
      }
    });
  });
}

/**
 * Format data to be processed
 * @param {Collection} data Array of mongo documents
 * @return {Object}
 */
function formatDataAsObject (data) {
  var formatted = {};
  _.forIn(data, function(value) {
    formatted[value.movieId] = formatted[value.movieId] || {};
    formatted[value.movieId][value.userId] = value.rating;
  });
  return formatted;
}

// Execute query and build comparisons
module.exports = function (req, res) {
  Rating
    .find({})
    .select('userId movieId rating')
    .limit(3000)
    .lean(true)
    .exec(function(error, ratings) {
      if (error) console.error(error);
      buildMovieComparison(formatDataAsObject(ratings));
      res.sendStatus(200);
    });
};
