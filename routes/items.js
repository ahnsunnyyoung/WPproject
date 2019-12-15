const express = require('express');
const Item = require('../models/item');
const Reservation = require('../models/reservation');
const User = require('../models/user'); 
const Review = require('../models/review'); 
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
  const reviews = await Review.find({item: item.id});
  await item.save();
  res.render('items/show', {item: item, reviews: reviews});
}));

router.put('/:id', catchErrors(async (req, res, next) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    req.flash('danger', 'Not exist post');
    return res.redirect('back');
  }
  item.itemName = req.body.itemName;
  item.city = req.body.city;
  item.country = req.body.country;
  item.price = req.body.price;
  item.intro = req.body.intro;
  item.startDay = req.body.startDay;
  item.endDay = req.body.endDay;
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
    cNo: user._id,
    itemName: req.body.itemName,
    city: req.body.city,
    country: req.body.country,
    price: req.body.price,
    intro: req.body.intro,
    startDay: req.body.startDay,
    endDay: req.body.endDay,
    img: req.body.img
  });
  await item.save();
  req.flash('success', 'Successfully posted');
  res.redirect('/');
}));

router.post('/:id/reviews', needAuth, catchErrors(async (req, res, next) => {
  const user = req.session.user;
  const item = await Item.findById(req.params.id);

  if (!item) {
    req.flash('danger', 'Not exist item');
    return res.redirect('back');
  }

  var review = new Review({
    uid: user._id,
    item: item._id,
    content: req.body.content
  });
  await review.save();
  item.numReviews++;
  await item.save();

  req.flash('success', 'Successfully reviewed');
  res.redirect(`/items/${req.params.id}`);
}));


//예약!
router.get('/reserve/:id', needAuth, catchErrors(async (req, res, next) => {
  const item = await Item.findById(req.params.id);
  res.render('reservations/index', {item: item, reservation: {}});
}));

router.post('/reserve/:id', needAuth, catchErrors(async (req, res, next) => {
  const item = await Item.findById(req.params.id);
  var reservation = new Reservation({
    itemNo: req.params.id,
    itemName: item.itemName,
    cNo: item.cNo,
    perNum: req.body.perNum
  });
  await reservation.save();  
  console.log(reservation.cNo);
  const user = await User.findById(reservation.cNo);
  console.log(user.name);
  res.render('reservations/finish', {reservation: reservation, user: user, item: item});
}));


module.exports = router;
