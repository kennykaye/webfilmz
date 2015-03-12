'use strict';

var mongoose = require('mongoose');

function MovieSchema () {
  var Schema = mongoose.Schema;

  return new Schema({
    id: { type: Number, required: true },
    title: { type: String, required: true },
    year: { type: String },
    imdb: {
      id: { type: Number },
      pictureUrl: { type: String }
    },
    rottenTomatoes: {
      id: { type: String },
      allCriticsRating: { type: Number },
      allCriticsNumReviews: { type: Number },
      allCriticsNumFresh: { type: Number },
      allCriticsNumRotten: { type: Number },
      allCriticsScore: { type: Number },
      topCriticsRating: { type: Number },
      topCriticsNumReviews: { type: Number },
      topCriticsNumFresh: { type: Number },
      topCriticsNumRotten: { type: Number },
      audienceRating: { type: Number },
      audienceNumRatings: { type: Number }
    }
  });
}

module.exports = mongoose.model('movie', MovieSchema());
