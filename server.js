var express       = require('express')
    , app         = express()
    , mongoose    = require('mongoose')
    , passport    = require('passport')
    , flash       = require('connect-flash')
    , morgan      = require('morgan')
    , cookieParser = require('cookie-parser')
    , bodyParser  = require('body-parser')
    , methodOverride = require('method-override')
    , expressSession = require('express-session')
    , Twig        = require('twig')
    , twig        = Twig.twig;


var port = process.env.PORT || 8080;
var configDB = require('./config/database.js')



// configuration ===============================================================
mongoose.connect(configDB.url)


// require('./config/passport')(passport); // pass passport for configuration



// set up express application
app.use(express.static(__dirname + '/public'))
app.use(morgan('dev'))
app.use(cookieParser())
app.use(bodyParser())
app.use(methodOverride())

app.set('view engine', 'twig')
app.set("twig options", {
    strict_variables: false
})
app.set('views', 'app/views')

// required for passport
app.use(expressSession( { secret: 'node-authentication-demo' } ))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())




// routes ===============================================================
require('./app/routes.js')(app, passport)


// launch ===============================================================
app.listen(port)
console.log('Express App Launched, listening on port ' + port);