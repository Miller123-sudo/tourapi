const User = require('./../Models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/apperror');
const sendEmail = require('./../utils/email');
const logger = require('./../logger');
const Audit = require('./../Models/auditModel');

const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const nodemailer = require('nodemailer');
const crypto = require('crypto');


// const { decode } = require('punycode');
// const { use } = require('../routes/userRoute');

const signToken = id => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    res.cookie('jwt', token, {
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        // secure: true,
        httpOnly: true
    });

    res.status(statusCode).json({
        status: "success",
        token: token,
        data: {
            user: user
        }
    });
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt
    });

    createSendToken(newUser, 201, res);

    //const token = signToken(newUser._id);

    // const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    //     expiresIn: process.env.JWT_EXPIRES_IN
    // });

    //send mail to user when an user created(from line 45 - 67)
    /*var transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'dasbiswajit56013@gmail.com',
            pass: 'placement'
        }
    });

    var mailOptions = {
        from: 'dasbiswajit56013@gmail.com',
        to: 'dassaikat848@gmail.com',
        subject: 'Your account password',
        text: `Your password is:- ${req.body.password}`
    };

    transport.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        }
        else {
            console.log(`Email send ${info.response}`);
        }
    });*/

    // res.status(201).json({
    //     status: "Signup success",
    //     token: token,
    //     data: {
    //         user: newUser
    //     }
    // });
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    //1)check if email and password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
    }
    //2)check if user exists and password is correct
    const user = await User.findOne({ email: email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    // console.log(user);
    //3)if everything is ok, send token to client
    createSendToken(user, 200, res);
    // const token = signToken(user._id);

    // res.status(200).send({
    //     data: {
    //         status: ' Login success',
    //         token
    //     }
    // });
});

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        status: 'success'
    });
}

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    //1)getting token and check if it is there
    if (req.headers.authorization) {
        token = req.headers.authorization.split(' ')[1];
    }
    else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    // console.log(token);
    if (!token) {
        return next(new AppError('You are not logged in!! Please log in to get access', 401));
    }

    //2)verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // console.log(decoded);

    //3)check if user still exist
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
        return next(new AppError('The user belonging to the token does not exist', 401));
    }

    //4)check if user changed password after the token was issue
    if (freshUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User changed his/her password. Please login again!!', 401));
    }

    //grant access to protected route
    req.user = freshUser;
    res.locals.user = freshUser;
    next();
});

//purpose of this middleware is to check whether any user logged in or not. and if not then no error shows
exports.isLoggedIn = async (req, res, next) => {

    let token;
    //1)getting token and check if it is there
    /*if (req.headers.authorization) {
        token = req.headers.authorization.split(' ')[1];
    }
    else*/ if (req.cookies.jwt) {
        token = req.cookies.jwt;

        try {
            // console.log(token);
            // if (!token) {
            //     return next();
            // }

            //2)verification token
            const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
            // console.log(decoded);

            //3)check if user still exist
            const freshUser = await User.findById(decoded.id);
            if (!freshUser) {
                return next();
            }

            //4)check if user changed password after the token was issue
            if (freshUser.changedPasswordAfter(decoded.iat)) {
                return next();
            }

            //grant access to protected route
            // req.user = freshUser;
            res.locals.user = freshUser;
            return next();
        } catch (err) {
            return next();
        }
    }
    next();
};

//this method is to restrict users to perform some activity....
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this activity!!', 403));
        }
        next();
    }
}

//this method is going to update the current login user's password
exports.updatePassword = catchAsync(async (req, res, next) => {

    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
        return next(new AppError('Your current password is wrong!!!', 401));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    createSendToken(user, 200, res);

});

exports.forgotPassword = catchAsync(async (req, res, next) => {
    //1)get user based on posted email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('There are no user with that email!!', 404));
    }

    //2)generate the random token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    //3)send that token to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a patch request with your new password and confirm password to: 
    ${resetURL}.\n If you did not forgot your password, ignore this mail!.`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'your password reset token (valid for 10 min)',
            message
        });

        res.status(200).json({
            status: 'success',
            message: 'token send to email'
        });
    } catch (error) {
        user.createPasswordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError('There was an error in sending main. try again letter!!', 500));
    }

})

exports.resetPassword = catchAsync(async (req, res, next) => {

    //1)get user based on token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: {
            $gt: Date.now()
        }
    });

    //2)If token has not expired and there is user, then set the password
    if (!user) {
        return next(new AppError('Token is invalid or expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    //3)upadte the changedPasswordAt property for the user
    createSendToken(user, 200, res);

    //4)Log the user in and send JWT
    res.status(200).render('reset', {
        title: 'success'
    });

})