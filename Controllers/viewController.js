const Cust = require('./../Models/tourmodel');
const User = require('./../Models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/apperror');


exports.getOverview = catchAsync(async (req, res) => {
    const tours = await Cust.find();

    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Cust.findOne({ name: req.params.name });
    // console.log(tour);
    if (!tour) {
        return next(new AppError('There is no tour with that name!!!', 404));
    }

    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour
    });
});

exports.getLoginForm = (req, res) => {

    res.status(200).render('login', {
        title: 'Log into your account'
    });
}

exports.getAccountFrom = (req, res) => {

    res.status(200).render('account', {
        title: 'My Account'
    });
}

exports.updateUserData = catchAsync(async (req, res, next) => {
    const updateUser = await User.findByIdAndUpdate(req.user.id, {
        name: req.body.name,
        email: req.body.email
    },
        {
            new: true,
            runValidators: true
        }
    );

    res.status(200).render('account', {
        title: 'My Account',
        user: updateUser
    });
})

exports.getSignupFrom = (req, res) => {

    res.status(200).render('signup', {
        title: 'Sign up'
    });
}

// exports.resetp = (req, res) => {

//     res.status(200).render('reset', {
//         title: 'success'
//     });

// }