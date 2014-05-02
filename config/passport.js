// Load everything we need
var LocalStrategy = require('passport-local').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    TwitterStrategy = require('passport-twitter').Strategy,
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

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
  // LOCAL SIGNUP =======================
  // ====================================
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
      User.findOne({ 'local.email' : email }, function(err, existingUser) {
        // if errors, return the error
        if (err) {
          return done(err)
        }


        if (existingUser) {
          return done(null, false, req.flash('signupMessage', 'That email is already taken.'))
        }



        if(req.user) {

          var user = req.user;
          user.local.email = email;
          user.local.password = user.generateHash(password);

          // save new local account
          user.save(function(err, user) {
            if (err) throw err;

            return done(null, user);
          })


        } else {

          // No user, register one
          var newUser = new User()

          // set newUser attrs
          newUser.local.email = email;
          newUser.local.password = newUser.generateHash(password);

          // Save newUser
          newUser.save(function(err) {
            if (err)
              throw err;
            return done(null, newUser)
          })
        }
      })
    })
  }))



  // ====================================
  // FACEBOOK ===========================
  // ====================================
  passport.use(new FacebookStrategy({
    clientID            : configAuth.facebookAuth.clientID,
    clientSecret        : configAuth.facebookAuth.clientSecret,
    callbackURL         : configAuth.facebookAuth.callbackURL,
    passReqToCallback   : true
  },

  function(req, token, refreshToken, profile, done) {

    // async
    process.nextTick(function() {

      if (!req.user) {

        User.findOne({ 'facebook.id': profile.id }, function(err, user) {

          if (err) return done(err)

          if (user) {
            // re-add token to user
            if(!user.facebook.token) {
              user.facebook.token = token;
              user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
              user.facebook.email = profile.emails[0].value;

              user.save(function(err) {
                if (err) throw err;

                return done(null, user)
              })
            } // (!user.facebook.token)

            // user found
            return done(null, user)
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

      } // (!req.user)
      else {

        // user already exists
        var user = req.user;

        // update the users facebook creds
        user.facebook.id = profile.id;
        user.facebook.token = token;
        user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
        user.facebook.email = profile.emails[0].value;

        //save user
        user.save(function(err) {
          if (err) throw err;

          return done(null, user);
        })
      }


    })
  }))



  // ====================================
  // TWITTER ============================
  // ====================================
  passport.use(new TwitterStrategy({
    consumerKey               : configAuth.twitterAuth.consumerKey,
    consumerSecret            : configAuth.twitterAuth.consumerSecret,
    callbackURL               : configAuth.twitterAuth.callbackURL,
    passReqToCallback         : true
  },

  function(req, token, tokenSecret, profile, done) {

    // async
    process.nextTick(function() {

      if (!req.user) {

        User.findOne({ 'twitter.id' : profile.id }, function(err, user) {

          if (err) return done(err)

          // User exists, login
          if (user) {
            // re-add token to user
            if(!user.twitter.token) {
              user.twitter.id = profile.id;
              user.twitter.token = token;
              user.twitter.name = profile.username;
              user.twitter.displayName = profile.displayName;

              user.save(function(err) {
                if (err) throw err;

                return done(null, user)
              })
            } // (!user.twitter.token)

            // user found
            return done(null, user);
          }

          // User doesn't exist, register them
          else {
            // create newUser
            var newUser = new User()

            // set all of the user data that we need
            newUser.twitter.id          = profile.id;
            newUser.twitter.token       = token;
            newUser.twitter.username    = profile.username;
            newUser.twitter.displayName = profile.displayName;


            // save user
            newUser.save(function(err, user) {
              if (err) throw err;

              return done(null, newUser)
            })
          }
        })

      } // (!req.user)
      else {
        // user exists
        var user = req.user;

        user.twitter.id = profile.id;
        user.twitter.token = token;
        user.twitter.username = profile.username;
        user.twitter.displayName = profile.displayName;

        // save user
        user.save(function(err, user) {
          if (err) throw err;

          return done(null, user)
        })
      }

    })
  }))





  // ====================================
  // GOOGLE =============================
  // ====================================
  passport.use(new GoogleStrategy({
    clientID                : configAuth.googleAuth.clientID,
    clientSecret            : configAuth.googleAuth.clientSecret,
    callbackURL             : configAuth.googleAuth.callbackURL,
    passReqToCallback       : true
  },

  function(req, token, refreshToken, profile, done) {

    // async
    process.nextTick(function() {

      if (!req.user) {
        User.findOne({ 'google.id' : profile.id }, function(err, user) {

          if (err) return done(err)

          // User exists, login
          if (user) {
            // re-add token to user
            if(!user.google.token) {
              user.google.id = profile.id;
              user.google.token = token;
              user.google.name = profile.displayName;
              user.google.email = profile.emails[0].value;

              user.save(function(err) {
                if (err) throw err;

                return done(null, user)
              })
            } // (!user.google.token)

            // user found
            return done(null, user);
          }
          // User doesn't exist, register them
          else {
            // create newUser
            var newUser = new User()

            // set all of the user data that we need
            newUser.google.id          = profile.id;
            newUser.google.token       = token;
            newUser.google.name        = profile.displayName;
            newUser.google.email       = profile.emails[0].value;


            // save user
            newUser.save(function(err, user) {
              if (err) throw err;

              return done(null, newUser)
            })
          }
        })
      } // (!req.user)
      else {
        // user exists
        var user = req.user;

        user.google.id = profile.id;
        user.google.token = token;
        user.google.name = profile.displayName;
        user.google.email = profile.emails[0].value;

        // save user
        user.save(function(err, user) {
          if (err) throw err;

          return done(null, user)
        })
      }
    })
  }))



}