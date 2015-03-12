var mongoose = require('mongoose');

function RecommendationSchema () {
  var Schema = mongoose.Schema;

  return new Schema({
    movieId: { type: Number, required: true },
    similarity: { type: Number, required: true },
    targetMovieId: { type: Number, required: true }
  });
}

module.exports = mongoose.model('recommendation', RecommendationSchema());
