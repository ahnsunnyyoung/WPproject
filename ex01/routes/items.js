const express = require('express');
const Item = require('../models/item');
// const User = require('../models/user'); 
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

router.get('/new', needAuth, (req, res, next) => {
  res.render('items/new', {item: {}});
});

router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
  const item = await Item.findById(req.params.id);
  res.render('items/edit', {item: item});
}));

router.get('/:id', catchErrors(async (req, res, next) => {
  const item = await Item.findById(req.params.id);
  const comments = await Comment.find({item: item.id});
  await item.save();
  res.render('items/show', {item: item, comments: comments});
}));

router.put('/:id', catchErrors(async (req, res, next) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    req.flash('danger', 'Not exist post');
    return res.redirect('back');
  }
  item.itemName = req.body.itemName;
  item.price = req.bodey.price;
  item.intro = req.body.intro;
  item.img = req.body.img;

  await item.save();
  req.flash('success', 'Successfully updated');
  res.redirect('/');
}));

router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
  await Item.findOneAndRemove({_id: req.params.id});
  req.flash('success', 'Successfully deleted');
  res.redirect('/');
}));

router.post('/', needAuth, catchErrors(async (req, res, next) => {
  const user = req.session.user;
  var item = new Item({
    itemName: req.body.itemName,
    price: req.body.price,
    intro: req.body.intro,
    img: req.body.img
  });
  await item.save();
  req.flash('success', 'Successfully posted');
  res.redirect('/');
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
