const express = require('express');
const viewController = require('./../Controllers/viewController');
const authController = require('./../Controllers/authController');

const router = express.Router();

// router.use(authController.isLoggedIn);//this router is use for all view template

router.get('/', authController.isLoggedIn, viewController.getOverview);
router.get('/tour/:name', authController.isLoggedIn, viewController.getTour);
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get('/me', authController.protect, viewController.getAccountFrom);
router.get('/signup', viewController.getSignupFrom);


router.post('/submit-user-data', authController.protect, viewController.updateUserData);
// router.post('/resetp', viewController.resetp);



module.exports = router;