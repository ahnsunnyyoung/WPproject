const express = require('express');
const Item = require('../models/item');
const Reservation = require('../models/reservation');
const User = require('../models/user');  
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


/* GET users listing. */
router.get('/', needAuth, (req, res, next) => {
    User.find({}, function(err, users) {
      if (err) {
        return next(err);
      }
      console.log("err", err);
      console.log(users);
      
      res.render('mytour/index', {users: users});
    }); // TODO: pagination?
  });
  
//   router.get('/new', (req, res, next) => {
//     console.log(req.params);
//     res.render('users/new', {messages: req.flash()});
//   });
  
//   router.get('/:id/edit', needAuth, (req, res, next) => {
//     User.findById(req.params.id, function(err, user) {
//       if (err) {
//         return next(err);
//       }
//       res.render('users/edit', {user: user});
//     });
//   });
  
//   router.put('/:id', needAuth, (req, res, next) => {
//     var err = validateForm(req.body);
//     if (err) {
//       req.flash('danger', err);
//       return res.redirect('back');
//     }
  
//     User.findById({_id: req.params.id}, function(err, user) {
//       if (err) {
//         return next(err);
//       }
//       if (!user) {
//         req.flash('danger', 'Not exist user.');
//         return res.redirect('back');
//       }
  
//       if (user.password !== req.body.current_password) {
//         req.flash('danger', 'Password is incorrect');
//         return res.redirect('back');
//       }
  
//       user.name = req.body.name;
//       user.email = req.body.email;
//       if (req.body.password) {
//         user.password = req.body.password;
//       }
  
//       user.save(function(err) {
//         if (err) {
//           return next(err);
//         }
//         req.flash('success', 'Updated successfully.');
//         res.redirect('/users');
//       });
//     });
//   });
  
//   router.delete('/:id', needAuth, (req, res, next) => {
//     User.findOneAndRemove({_id: req.params.id}, function(err) {
//       if (err) {
//         return next(err);
//       }
//       req.flash('success', 'Deleted Successfully.');
//       res.redirect('/users');
//     });
//   });
  
//   router.get('/:id', (req, res, next) => {
//     User.findById(req.params.id, function(err, user) {
//       if (err) {
//         return next(err);
//       }
//       res.render('users/show', {user: user});
//     });
//   });
  
//   router.post('/', (req, res, next) => {
//     var err = validateForm(req.body, {needPassword: true});
//     if (err) {
//       req.flash('danger', err);
//       return res.redirect('back');
//     }
//     User.findOne({email: req.body.email}, function(err, user) {
//       if (err) {
//         return next(err);
//       }
//       if (user) {
//         req.flash('danger', 'Email address already exists.');
//         return res.redirect('back');
//       }
//       var newUser = new User({
//         name: req.body.name,
//         email: req.body.email,
//         type: req.body.type
//       });
//       newUser.password = req.body.password;
  
//       newUser.save(function(err) {
//         if (err) {
//           return next(err);
//         } else {
//           req.flash('success', 'Registered successfully. Please sign in.');
//           res.redirect('/');
//         }
//       });
//     });
//   });


module.exports = router;
