'use strict';

var mongoose = require('mongoose');

function RatingSchema () {
  var Schema = mongoose.Schema;

  return new Schema({
    userId: { type: Number, required: true },
    movieId: { type: Number, required: true },
    rating: { type: Number, required: true },
    date: { type: Date }
  });
}

module.exports = mongoose.model('rating', RatingSchema());
