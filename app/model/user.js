//user.js

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  name: String,
  fb_id: { type: String, required: true, unique: true },
  created_at: Date,
  updated_at: Date
});

var User = mongoose.model('User', userSchema);

userSchema.pre('update', function(next) {

  var currentDate = new Date();

  this.updated_at = currentDate;

  if (!this.created_at)
    this.created_at = currentDate;

  next();
});

module.exports = mongoose.model('User', userSchema);