const express = require('express');
const Item = require('../models/item');
const User = require('../models/user'); 
const Comment = require('../models/review'); 
const catchErrors = require('../lib/async-error');

const router = express.Router();

// 동일한 코드가 users.js에도 있습니다. 이것은 나중에 수정합시다.
function needAuth(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.flash('danger', 'Please signin first.');
    res.redirect('/signin');
  }
}

/* GET boards listing. */
router.get('/', catchErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  var query = {};
  const term = req.query.term;
  if (term) {
    query = {$or: [
      {title: {'$regex': term, '$options': 'i'}},
      {content: {'$regex': term, '$options': 'i'}}
    ]};
  }
  const items = await Item.paginate(query, {
    sort: {createdAt: -1}, 
    populate: 'uid', 
    page: page, limit: limit
  });
  res.render('items/index', {items: items, query: req.query});
}));

router.get('/new', needAuth, (req, res, next) => {
  res.render('items/new', {item: {}});
});

router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
  const item = await Item.findById(req.params.id);
  res.render('items/edit', {item: item});
}));

router.get('/:id', catchErrors(async (req, res, next) => {
  const item = await Item.findById(req.params.id).populate('uid');
  const comments = await Comment.find({item: item.id}).populate('uid');
  await item.save();
  res.render('items/show', {item: item, comments: comments});
}));

router.put('/:id', catchErrors(async (req, res, next) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    req.flash('danger', 'Not exist post');
    return res.redirect('back');
  }
  item.title = req.body.title;
  item.content = req.body.content;

  await item.save();
  req.flash('success', 'Successfully updated');
  res.redirect('/items');
}));

router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
  await Item.findOneAndRemove({_id: req.params.id});
  req.flash('success', 'Successfully deleted');
  res.redirect('/items');
}));

router.post('/', needAuth, catchErrors(async (req, res, next) => {
  const user = req.session.user;
  var item = new Item({
    title: req.body.title,
    uid: user._id,
    content: req.body.content,
  });
  await item.save();
  req.flash('success', 'Successfully posted');
  res.redirect('/items');
}));

router.post('/:id/comments', needAuth, catchErrors(async (req, res, next) => {
  const user = req.session.user;
  const item = await Item.findById(req.params.id);

  if (!item) {
    req.flash('danger', 'Not exist item');
    return res.redirect('back');
  }

  var comment = new Comment({
    uid: user._id,
    item: item._id,
    content: req.body.content
  });
  await comment.save();
  item.numComments++;
  await item.save();

  req.flash('success', 'Successfully commented');
  res.redirect(`/items/${req.params.id}`);
}));



module.exports = router;
