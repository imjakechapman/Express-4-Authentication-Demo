// Load everything we need
var LocalStrategy = require('passport-local').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    TwitterStrategy = require('passport-twitter').Strategy;

// Load User Model
var User = require('../app/models/user')


// Load the auth object
var configAuth = require('./auth')


// expose passport configuration to app
module.exports = function(passport) {

  //
  // Passport Session Setup
  //

  // serialize user (making sure we don't store everything from a user, only the necessary, typically just ID)
  passport.serializeUser(function(user, done) {
    done(null, user.id)
  })

  // deserialize user (creating full user object)
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user)
    })
  })




  //
  // Local Signup
  //
  passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  function(req, email, password, done){

    // async
    // User.findOne won't fire unless data is sent back
    process.nextTick(function() {

      // find user whos email is the same as the forms email
      User.findOne({ 'local.email' : email }, function(err, user) {
        // if errors, return the error
        if (err) {
          return done(err)
        }


        if (user) {
          return done(null, false, req.flash('signupMessage', 'That email is already taken.'))
        } else {

          // No user, register one
          var newUser = new User();

          // set newUser attrs
          newUser.local.email = email;
          newUser.local.password = newUser.generateHash(password);

          // Save newUser
          newUser.save(function(err) {
            if (err)
              throw err;
            return done(null, newUser);
          })
        }
      })
    })
  }))


  // Local Login
  passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  function(req, email, password, done){

    User.findOne({ 'local.email': email }, function(err, user) {
      // Error
      if (err) {
        return done(err)
      }


      // User not found
      if (!user) {
        return done(null, false, req.flash('loginMessage', 'No user found!'))
      }

      if (!user.validPassword(password)) {
        return done(null, false, req.flash('loginMessage', 'Wrong password, try again.'))
      }

      return done(null, user)

    })
  }))





  // ====================================
  // FACEBOOK ===========================
  // ====================================
  passport.use(new FacebookStrategy({
    clientID: configAuth.facebookAuth.clientId,
    clientSecret: configAuth.facebookAuth.clientSecret,
    callbackURL: configAuth.facebookAuth.callback
  },

  function(token, refreshToken, profile, done) {

    // async
    process.nextTick(function() {

      User.findOne({ 'facebook.id': profile.id }, function(err, user) {

        if (err) return done(err)

        if (user) {
          return done(null, user);
        }
        else {
          // create newUser
          var newUser = new User()

          // set all of the facebook information on user
          newUser.facebook.id = profile.id;
          newUser.facebook.token = token;
          newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
          newUser.facebook.email = profile.emails[0].value;


          // save newUser to db
          newUser.save(function(err) {
            if (err) throw err;

            return done(null, newUser)
          })
        }
      })
    })
  }))



  // ====================================
  // TWITTER ============================
  // ====================================
  passport.use(new TwitterStrategy({
    consumerKey   : configAuth.twitterAuth.consumerKey,
    consumerSecret : configAuth.twitterAuth.consumerSecret,
    callbackURL   : configAuth.twitterAuth.callbackURL
  },

  function(token, tokenSecret, profile, done) {

    // async
    process.nextTick(function() {

      User.findOne({ 'twitter.id' : profile.id }, function(err, user) {

        if (err) return done(err)

        // User exists, login
        if (user) {
          return done(null, user);
        }
        // User doesn't exist, register them
        else {
          // create newUser
          var newUser = new User();

          // set all of the user data that we need
          newUser.twitter.id          = profile.id;
          newUser.twitter.token       = token;
          newUser.twitter.username    = profile.username;
          newUser.twitter.displayName = profile.displayName;


          // save user
          newUser.save(function(err, user) {
            if (err) throw err;

            return done(null, newUser);
          })
        }
      })
    })
  }))


}