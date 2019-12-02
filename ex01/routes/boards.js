const express = require('express');
const Board = require('../models/board');
const User = require('../models/user'); 
const Comment = require('../models/comment'); 
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
  const boards = await Board.paginate(query, {
    sort: {createdAt: -1}, 
    populate: 'uid', 
    page: page, limit: limit
  });
  res.render('boards/index', {boards: boards, query: req.query});
}));

router.get('/new', needAuth, (req, res, next) => {
  res.render('boards/new', {board: {}});
});

router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
  const board = await Board.findById(req.params.id);
  res.render('boards/edit', {board: board});
}));

router.get('/:id', catchErrors(async (req, res, next) => {
  const board = await Board.findById(req.params.id).populate('uid');
  const comments = await Comment.find({board: board.id}).populate('uid');
  await board.save();
  res.render('boards/show', {board: board, comments: comments});
}));

router.put('/:id', catchErrors(async (req, res, next) => {
  const board = await Board.findById(req.params.id);

  if (!board) {
    req.flash('danger', 'Not exist post');
    return res.redirect('back');
  }
  board.title = req.body.title;
  board.content = req.body.content;

  await board.save();
  req.flash('success', 'Successfully updated');
  res.redirect('/boards');
}));

router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
  await Board.findOneAndRemove({_id: req.params.id});
  req.flash('success', 'Successfully deleted');
  res.redirect('/boards');
}));

router.post('/', needAuth, catchErrors(async (req, res, next) => {
  const user = req.session.user;
  var board = new Board({
    title: req.body.title,
    uid: user._id,
    content: req.body.content,
  });
  await board.save();
  req.flash('success', 'Successfully posted');
  res.redirect('/boards');
}));

router.post('/:id/comments', needAuth, catchErrors(async (req, res, next) => {
  const user = req.session.user;
  const board = await Board.findById(req.params.id);

  if (!board) {
    req.flash('danger', 'Not exist board');
    return res.redirect('back');
  }

  var comment = new Comment({
    uid: user._id,
    board: board._id,
    content: req.body.content
  });
  await comment.save();
  board.numComments++;
  await board.save();

  req.flash('success', 'Successfully commented');
  res.redirect(`/boards/${req.params.id}`);
}));



module.exports = router;
