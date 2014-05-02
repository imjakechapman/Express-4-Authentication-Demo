module.exports = function(app, router, passport) {


  // =====================================
  // HOME PAGE (with login links) ========
  // =====================================
  router.get('/', function(req, res) {
    // load index
    res.render('index');
  })



  // =====================================
  // LOGIN ===============================
  // =====================================
  app.route('/login')
    // show the login form
    .get(function(req, res) {
      // render the page and pass in any flash data if it exists
      res.render('login/index', { message: req.flash('loginMessage') }); 
    })

    // process the login form
    .post(passport.authenticate('local-login', {
      successRedirect: '/profile',
      failureRedirect: '/login',
      failureFlash: true
    }))


  // =====================================
  // LOGOUT ==============================
  // =====================================
  router.get('/logout', function(req, res) {
    req.logout()
    res.redirect('/')
  })



  // =====================================
  // SIGNUP ==============================
  // =====================================
  app.route('/signup')
    // show the signup form
    .get(function(req, res) {

      // render the page and pass in any flash data if it exists
      res.render('register/index', { message: req.flash('signupMessage') });
    })

    // process the signup form
    .post(passport.authenticate('local-signup', {
      successRedirect: '/profile',
      failureRedirect: '/signup',
      failureFlash: true
    }))



  // =====================================
  // PROFILE SECTION =====================
  // =====================================
  // we will want this protected so you have to be logged in to visit
  // we will use route middleware to verify this (the isLoggedIn function)
  router.get('/profile', isLoggedIn, function(req, res) {
    res.render('profile', {
      user : req.user // get the user out of session and pass to template
    })
  })






// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

  // =====================================
  // FACEBOOOK ROUTES ====================
  // =====================================
  router.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email'}))

  // facebook callback
  router.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      successRedirect: '/profile',
      failureRedirect: '/'
    }))


  // =====================================
  // FACEBOOOK ROUTES ====================
  // =====================================
  router.get('/auth/twitter', passport.authenticate('twitter'))

  // auth callback
  router.get('/auth/twitter/callback',
    passport.authenticate('twitter', {
      successRedirect: '/profile',
      failureRedirect: '/'
    }))


  // =====================================
  // GOOGLE ROUTES =======================
  // =====================================
  router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email']}))

  // auth callback
  router.get('/auth/google/callback',
    passport.authenticate('google', {
      successRedirect: '/profile',
      failureRedirect: '/'
    }))






// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

  // locally ---------------
  app.route('/connect/local')
    .get(function(req, res) {
      res.render('register/connect-local', { message: req.flash('loginMessage') })
    })

    .post(passport.authenticate('local-signup', {
      successRedirect   : '/profile',
      failureRedirect   : '/connect/local',
      failureFlash      : true
    }))



  // Facebook -------------
  router.get('/connect/facebook', passport.authorize('facebook', { scope: 'email'}))

  // connect callback
  router.get('/connect/facebook/callback',
    passport.authorize('facebook', {
      successRedirect   : '/profile',
      failureRedirect   : '/'
    }))


  // Twitter -------------

  router.get('/connect/twitter', passport.authorize('twitter', { scope: 'email'}))

  // connect callback
  router.get('/connect/twitter/callback',
    passport.authorize('twitter', {
      successRedirect   : '/profile',
      failureRedirect   : '/'
    }))


  // Google -------------
  router.get('/connect/google', passport.authorize('google', { scope: ['profile', 'email'] }))

  // connect callback
  router.get('/connect/google/callback',
    passport.authorize('google', {
      successRedirect   : '/profile',
      failureRedirect   : '/'
    }))



// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================

  // Local unlink -----------------
  router.get('/unlink/local', function(req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function(err) {
      res.redirect('/profile')
    })
  })

  // Facebook unlink -----------------
  router.get('/unlink/facebook', function(req, res) {
    var user = req.user;
    user.facebook.token = undefined;
    user.save(function(err) {
      res.redirect('/profile')
    })
  })


  // Twitter unlink -----------------
  router.get('/unlink/twitter', function(req, res) {
    var user = req.user;
    user.twitter.token = undefined;
    user.save(function(err) {
      res.redirect('/profile')
    })
  })


  // Google unlink -----------------
  router.get('/unlink/google', function(req, res) {
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