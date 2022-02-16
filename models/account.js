var mongoose = require('mongoose'),
Schema = mongoose.Schema,
passportLocalMongoose = require('passport-local-mongoose');

const Account = new Schema({
    username: String,
    Full_name:String,
    password: String,
    created: {
      type: Date,
      default: Date.now
    },
    isadmin: {
      type: Boolean,
      default: false
    },
  });

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);