var express = require('express');
const User = require('../models/user');
const Item = require('../models/item');
const catchErrors = require('../lib/async-error');
var router = express.Router();
const uuidv4 = require('uuid/v4');



const aws = require('aws-sdk');
const S3_BUCKET = process.env.S3_BUCKET;
console.log(process.env.AWS_ACCESS_KEY_ID, S3_BUCKET);
router.get('/s3',function(req,res,next){
  const s3 = new aws.S3({region:'ap-northeast-2'});
  const filename = `${uuidv4()}/${req.query.filename}`;
  const type = req.query.type;
  const params = {
    Bucket: S3_BUCKET,
    Key: filename,
    Expires: 900,
    ContentType: type,
    ACL: 'public-read'
  };
  console.log(params);
  s3.getSignedUrl('putObject',params,function(err,data){
    if(err){
      console.log(err);
      return res.json({err:err});
    }
    console.log("RESULT=", data);
    res.json({
      signedRequest: data,
      url: `https://${S3_BUCKET}.s3.amazonaws.com/${filename}`
    });
  });
});


/* GET boards listing. */
router.get('/', catchErrors(async (req, res, next) => {
  const user = req.session.user;
  console.log(user);
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
    populate: 'cNo', 
    page: page, limit: limit
  });
  res.render('index', {items: items, query: req.query, user: user});
}));

router.get('/signin', function(req, res, next) {
  res.render('signin');
});

// 09-1. Session 참고: 세션을 이용한 로그인
router.post('/signin', catchErrors(async (req, res, next) => {
  const password = req.body.password;
  console.log(req.body.email);
  const user = await User.findOne({email: req.body.email});
  console.log("user", user);
  if (await user.validatePassword(password)) {
    req.session.user = user;
    req.flash('success', 'Welcome!');
    res.redirect('/');
  } else {
    req.flash('danger', 'Invalid username or password.');
    res.redirect('back');
  }
}));

router.get('/signout', function(req, res, next) {
  delete req.session.user;
  req.flash('success', 'Successfully signed out.');
  res.redirect('/');
});


module.exports = router;
