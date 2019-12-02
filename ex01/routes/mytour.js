var express = require('express'),
  User = require('../models/user');
var router = express.Router();

function needAuth(req, res, next) {
    if (req.session.user) {
      next();
    } else {
      req.flash('danger', 'Please signin first.');
      res.redirect('/signin');
    }
  }

  router.get('/', needAuth, (req, res, next) => {
    User.find({}, function(err, users) {
      if (err) {
        return next(err);
      }
      console.log("err", err);
      console.log(users);
      
      res.render('users/index', {users: users});
    }); // TODO: pagination?
  });
  
  router.get('/new', (req, res, next) => {
    console.log(req.params);
    res.render('users/new', {messages: req.flash()});
  });