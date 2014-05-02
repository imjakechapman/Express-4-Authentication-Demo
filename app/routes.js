// app/routes.js
module.exports = function(app, passport) {

  // =====================================
  // HOME PAGE (with login links) ========
  // =====================================
  app.get('/', function(req, res) {
    res.render('index'); // load the index file
  });



  // =====================================
  // LOGIN ===============================
  // =====================================
  // show the login form
  app.get('/login', function(req, res) {

    // render the page and pass in any flash data if it exists
    res.render('login/index', { message: req.flash('loginMessage') }); 
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
  }));


  // =====================================
  // LOGOUT ==============================
  // =====================================
  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });



  // =====================================
  // SIGNUP ==============================
  // =====================================
  // show the signup form
  app.get('/signup', function(req, res) {

    // render the page and pass in any flash data if it exists
    res.render('register/index', { message: req.flash('signupMessage') });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true
  }));



  // =====================================
  // PROFILE SECTION =====================
  // =====================================
  // we will want this protected so you have to be logged in to visit
  // we will use route middleware to verify this (the isLoggedIn function)
  app.get('/profile', isLoggedIn, function(req, res) {
    res.render('profile', {
      user : req.user // get the user out of session and pass to template
    });
  });






// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

  // =====================================
  // FACEBOOOK ROUTES ====================
  // =====================================
  app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email'}))

  // facebook callback
  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      successRedirect: '/profile',
      failureRedirect: '/'
    }))


  // =====================================
  // FACEBOOOK ROUTES ====================
  // =====================================
  app.get('/auth/twitter', passport.authenticate('twitter'))

  // auth callback
  app.get('/auth/twitter/callback',
    passport.authenticate('twitter', {
      successRedirect: '/profile',
      failureRedirect: '/'
    }))


  // =====================================
  // GOOGLE ROUTES =======================
  // =====================================
  app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email']}))

  // auth callback
  app.get('/auth/google/callback',
    passport.authenticate('google', {
      successRedirect: '/profile',
      failureRedirect: '/'
    }))






// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

  // locally ---------------
  app.get('/connect/local', function(req, res) {
    res.render('register/connect-local', { message: req.flash('loginMessage') })
  })

  app.post('/connect/local', passport.authenticate('local-signup', {
    successRedirect   : '/profile',
    failureRedirect   : '/connect/local',
    failureFlash      : true
  }))



  // Facebook -------------
  app.get('/connect/facebook', passport.authorize('facebook', { scope: 'email'}))

  // connect callback
  app.get('/connect/facebook/callback',
    passport.authorize('facebook', {
      successRedirect   : '/profile',
      failureRedirect   : '/'
    }))


  // Twitter -------------
  app.get('/connect/twitter', passport.authorize('twitter', { scope: 'email'}))

  // connect callback
  app.get('/connect/twitter/callback',
    passport.authorize('twitter', {
      successRedirect   : '/profile',
      failureRedirect   : '/'
    }))


  // Google -------------
  app.get('/connect/google', passport.authorize('google', { scope: ['profile', 'email'] }))

  // connect callback
  app.get('/connect/google/callback',
    passport.authorize('google', {
      successRedirect   : '/profile',
      failureRedirect   : '/'
    }))





// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================

// Local unlink -----------------
app.get('/unlink/local', function(req, res) {
  var user = req.user;
  user.local.email = undefined;
  user.local.password = undefined;
  user.save(function(err) {
    res.redirect('/profile')
  })
})

// Facebook unlink -----------------
app.get('/unlink/facebook', function(req, res) {
  var user = req.user;
  user.facebook.token = undefined;
  user.save(function(err) {
    res.redirect('/profile')
  })
})


// Twitter unlink -----------------
app.get('/unlink/twitter', function(req, res) {
  var user = req.user;
  user.twitter.token = undefined;
  user.save(function(err) {
    res.redirect('/profile')
  })
})


// Google unlink -----------------
app.get('/unlink/google', function(req, res) {
  var user = req.user;
  user.google.token = undefined;
  user.save(function(err) {
    res.redirect('/profile')
  })
})




} //  end module export




// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on 
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.redirect('/');
}