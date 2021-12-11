const mongoose = require("mongoose");
const validator = require('validator');

//............................schema creation.............................
const customerschema = new mongoose.Schema({
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
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        maxlength: [40, 'A tour must have less or equal than 40 charecter'],
        minlength: [10, 'A tour must have grater or equal than 10 charecter'],
        validate: [validator.isAlpha, 'Tour name must only contain charecters']
    },
    duration: {
        type: Number,
        required: [true, 'A tour must have duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either casy or medium or difficult'
        }
    },
    ratingsAvarage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be grater than 1.0'],
        max: [5, 'Rating must be less than 5.0']
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    summary: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a imageCover']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        // select: false
    },
    startDates: [Date]
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

customerschema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

//............................collection creation..........................
const Cust = mongoose.model("Cust", customerschema);

module.exports = Cust;