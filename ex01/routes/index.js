var express = require('express'),
User = require('../models/user');
const Item = require('../models/item');
const Comment = require('../models/review'); 
const catchErrors = require('../lib/async-error');
var router = express.Router();


/* GET boards listing. */
router.get('/', catchErrors(async (req, res, next) => {
  console.log("HERE", req.query, req.body);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;

  var query = {};
  const term = req.query.term;
  if (term) {
    query = {$or: [
      {itemName: {'$regex': term, '$options': 'i'}},
      {intro: {'$regex': term, '$options': 'i'}}
    ]};
  }
  const items = await Item.paginate(query, {
    sort: {createdAt: -1}, 
    page: page, limit: limit
  });
  res.render('index', {items: items, query: req.query});
}));

router.get('/signin', function(req, res, next) {
  res.render('signin');
});

// 09-1. Session 참고: 세션을 이용한 로그인
router.post('/signin', function(req, res, next) {
  User.findOne({email: req.body.email}, function(err, user) {
    if (err) {
      res.render('error', {message: "Error", error: err});
    } else if (!user || user.password !== req.body.password) {
      req.flash('danger', 'Invalid username or password.');
      res.redirect('back');
    } else {
      req.session.user = user;
      req.flash('success', 'Welcome!');
      res.redirect('/');
    }
  });
});

router.get('/signout', function(req, res, next) {
  delete req.session.user;
  req.flash('success', 'Successfully signed out.');
  res.redirect('/');
});


module.exports = router;
