const express = require("express");

const userController = require("./../Controllers/userController");
const authController = require("./../controllers/authController");

const router = express.Router();//create a router....

//Middleware to check there is an id given in req URL on router......
router.route('/get-User-By-Previous-Week/:week').get(userController.getUserByPreviousWeek);
router.route('/upsert/:name').patch(userController.upsert);

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.post('/updateMyPassword', authController.protect, authController.updatePassword);

router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);

router.route('/').get(userController.getAllUsers).post(/*userController.checkbody,*/ userController.createUser);
router.route('/:id').get(userController.getUser).post(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;