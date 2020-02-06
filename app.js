const express = require('express');
const exphbs  = require('express-handlebars');
const methodOverride = require('method-override')
const flash = require('connect-flash');
const session = require('express-session');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

// Connect to mongoose
mongoose.connect('mongodb://localhost/vidjet-dev', {useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {console.log('MongoDB Connected...')})
.catch(err => console.log(err));

//Load Idea Model
require('./models/Idea')
const Idea = mongoose.model('ideas')

// Handlebars Middleware
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// body parse middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// method override middleware
app.use(methodOverride('_method'));

//Express session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}));

app.use(flash());

//Global variables
app.use(function(req, res, next){
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
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

//Idea index page
app.get('/ideas', (req, res) => {
    Idea.find({})
    .sort({date: 'desc'})
    .lean()
    .then(ideas => {
        res.render('ideas/index', {
            ideas: ideas
        });
    });
})
//Add Idea Form
app.get('/ideas/add', (req, res) => {
    res.render('ideas/add');
});
//Edit Idea Form
app.get('/ideas/edit/:id', (req, res) => {
    Idea.findOne({
        _id: req.params.id
    })
    .then(idea => {
        res.render('ideas/edit', {
            id: idea._id,
            title: idea.title,
            details: idea.details,
        })
    })
});

//Process Form
app.post('/ideas', (req, res) => {
    let errors = [];

    if (!req.body.title) {
        errors.push({text: 'Please add a title'})
    }
    if (!req.body.details) {
        errors.push({text: 'Please add some details'})
    }
    if (errors.length > 0) {
        res.render('ideas/add', {
            errors: errors,
            title: req.body.title,
            details: req.body.details
        })
    }else{
        const newUser = {
            title: req.body.title,
            details: req.body.details
        }
        new Idea(newUser)
        .save()
        .then(idea => {
            req.flash('success_msg', 'Video Idea Added');
            res.redirect('/ideas')
        })
    }
});
//Edit Form Process
app.put('/ideas/:id', (req, res) => {
    Idea.findOne({
        _id: req.params.id
    })
    .then(idea => {
        //new values
        idea.title = req.body.title;
        idea.details = req.body.details;

        idea.save()
        .then(idea => {
            req.flash('success_msg', 'Video Idea Updated');
            res.redirect('/ideas')
        })
    })
});

//Delete Idea
app.delete('/ideas/:id', (req, res) => {
    Idea.remove({_id: req.params.id})
    .then(() => {
        req.flash('success_msg', 'Video Idea Removed');
        res.redirect('/ideas');
    })
})

const port = 5000;

app.listen(port, () => {
    console.log(`Server Started on port ${port}`);
    // console.log('Server Started on port ' + port);
});

