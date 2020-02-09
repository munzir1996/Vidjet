const express = require('express');
const path = require('path');
const exphbs  = require('express-handlebars');
const methodOverride = require('method-override')
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

//Load Routes
const ideas = require('./routes/ideas');
const users = require('./routes/users');

//Passport Config
require('./config/passport')(passport);

// Connect to mongoose
mongoose.connect('mongodb://localhost/vidjet-dev', {useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {console.log('MongoDB Connected...')})
.catch(err => console.log(err));

// Handlebars Middleware
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// body parse middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// method override middleware
app.use(methodOverride('_method'));

//Express session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}));

//Passport Midleware
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

//Global variables
app.use(function(req, res, next){
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
})

// Index Rroute
app.get('/', (req, res) => {
    const title = 'Welcome';
    res.render('index', {
        title: title,
    });
});

//About route
app.get('/about', (req, res) => {
    res.render('about');
});

app.use('/ideas', ideas);
app.use('/users', users);

const port = 5000;

app.listen(port, () => {
    console.log(`Server Started on port ${port}`);
    // console.log('Server Started on port ' + port);
});

