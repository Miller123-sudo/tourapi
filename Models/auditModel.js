const mongoose = require("mongoose");
const validator = require('validator');


//............................schema creation.............................
const auditSchema = new mongoose.Schema({

    //new schema for tour json file to inport into apicustomerdb database....
    setby: {
        type: String,
    },
    updateduserid: {
        type: Object,
    },
    context: {
        type: String,
    },
    type: {
        type: String,
    },
    field: {
        type: String,
    },
    oldvalue: {
        type: String,
    },
    newvalue: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        // select: false
    }
});


//............................collection creation..........................
const Audit = mongoose.model("Audit", auditSchema);

module.exports = Audit;