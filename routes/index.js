var express = require('express'),
User = require('../models/user');
const Item = require('../models/item');
const Comment = require('../models/review'); 
const catchErrors = require('../lib/async-error');
var router = express.Router();
const uuidv4 = require('uuid/v4');


//AWS_ACCESS_KEY_ID=AKIA3GTUUVOPEKXCVN56
//AWS_SECRET_ACCESS_KEY=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
//S3_BUCKET=tuon-img
const aws = require('aws-sdk');
const S3_BUCKET = process.env.S3_BUCKET;
console.log(S3_BUCKET);
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
    populate: 'cNo', 
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
