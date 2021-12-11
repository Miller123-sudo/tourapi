const fs = require('fs');
const mongoose = require("mongoose");
const dotenv = require('dotenv');
const tour = require('./../../models/tourmodel');
//const { deleteData } = require('../../Controllers/tourController');
dotenv.config({ path: './config.env' });


//.............................CONNECT DATABASE..........................
mongoose.connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true
}).then((con) => {
    //console.log(con.connections);
    console.log("DB connection success....");
}).catch((error) => console.log(error));

//read json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tour.json`, 'utf-8'));

//import data into DB
const importdata = async () => {
    try {
        await tour.create(tours);
        console.log('data created successfully');
    } catch (e) {
        console.log(e);
    }
};

const deleteData1 = async () => {
    try {
        await tour.deleteMany();
        console.log('data deleted successfully');
    } catch (e) {
        console.log(e);
    }
};

if (process.argv[2] === '--import') {
    importdata();
} else if (process.argv[2] === '--delete') {
    deleteData1();
}