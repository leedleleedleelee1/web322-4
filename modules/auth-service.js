const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Schema = mongoose.Schema;

const userSchema = new Schema({
  userName: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  loginHistory: [{
    dateTime: {
      type: Date,
      default: Date.now
    },
    userAgent: String
  }]
});

let User;

function initialize() {
  return new Promise((resolve, reject) => {
    let db = mongoose.createConnection(process.env.MONGODB, { useNewUrlParser: true, useUnifiedTopology: true });

    db.on('error', (err) => {
      reject(err);
    });

    db.once('open', () => {
      User = db.model("User", userSchema);
      resolve();
    });
  });
}

function registerUser(userData) {
  return bcrypt.hash(userData.password, 10)
    .then((hash) => {
      let newUser = new User({
        userName: userData.userName,
        password: hash,
        email: userData.email,
        loginHistory: []
      });
      return newUser.save();
    })
    .catch(err => {
      throw new Error("Error hashing password: " + err);
    });
}


function checkUser(userData) {
  return new Promise((resolve, reject) => {
    User.findOne({ userName: userData.userName }).exec().then((user) => {
      if (!user) {
        reject("Unable to find user: " + userData.userName);
      } else {
        bcrypt.compare(userData.password, user.password).then(result => {
          if (result) {
            user.loginHistory.unshift({ dateTime: new Date().toString(), userAgent: userData.userAgent });
            if (user.loginHistory.length > 8) {
              user.loginHistory.pop();
            }

            User.updateOne({ _id: user._id }, { $set: { loginHistory: user.loginHistory } }).exec().then(() => {
              resolve(user);
            }).catch(err => {
              reject("There was an error verifying the user: " + err);
            });
          } else {
            reject("Incorrect Password for user: " + userData.userName);
          }
        }).catch(err => {
          reject("Error comparing passwords: " + err);
        });
      }
    }).catch(err => {
      reject("Error fetching user data: " + err);
    });
  });
}

module.exports = {
  initialize,
  registerUser,
  checkUser
};
