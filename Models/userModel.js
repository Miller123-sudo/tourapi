const mongoose = require("mongoose");
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

//............................schema creation.............................
const userSchema = new mongoose.Schema({
    // Name: {
    //     type: String,
    //     required: [true, 'A tour must have a name'],
    //     unique: true,
    //     //lowercase: true
    // },
    // Phone: String

    //new schema for tour json file to inport into apicustomerdb database....
    name: {
        type: String,
        // required: [true, 'A user must have a name'],
        unique: true,
        trim: true,
        maxlength: [30, 'A user must have less or equal than 40 charecter'],
        minlength: [2, 'A user must have grater or equal than 10 charecter'],
        validate: [validator.isAlpha, 'user name must only contain charecters']
    },
    email: {
        type: String,
        // required: [true, 'A user must have a emial'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please enter a valid email']
    },
    photo: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'guide', 'lead-guide'],
        default: 'user'
    },
    password: {
        type: String,
        trim: true,
        required: [true, 'Please enter a password'],
        select: false//we do this because we don't want to see password in output
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please re-enter the password'],
        validate: {
            //this only work on CREATE and SAVE!!!
            validator: function (el) {
                return el === this.password;
            },
            message: 'Please enter password correctly'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        // select: false
    },
    updatedAt: {
        type: Date,
        default: Date.now(),
        // select: false
    },
    changedPasswordAt: {
        type: Date
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    },
    history: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Audit',
        }
    ],
    passwordResetToken: String,
    passwordResetExpires: Date
});

userSchema.pre('save', async function (next) {
    //Only run this function if password was actually modified...
    if (!this.isModified('password')) return next();

    //Hash the password with the cost 12...
    this.password = await bcrypt.hash(this.password, 12);

    //Delete passwordConfirm field....
    this.passwordConfirm = undefined;
});

userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.changedPasswordAt = Date.now();
    next();
});

userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const passwordChangedTime = parseInt(this.passwordChangedAt.getTime() / 1000);
        console.log(passwordChangedTime, JWTTimestamp);
        return JWTTimestamp < passwordChangedTime;
    }

    //false means password not changed
    return false;
}

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    console.log({ resetToken }, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

//............................collection creation..........................
const User = mongoose.model("User", userSchema);

module.exports = User;