const mongoose = require("mongoose");
const dotenv = require('dotenv');

const logger = require('./logger');

dotenv.config({ path: './config.env' });
const app = require('./app');

//.............................CONNECT DATABASE..........................
mongoose.connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true
}).then((con) => {
    //console.log(con.connections);
    console.log("DB connection success....");
}).catch((error) => console.log(error));

// //............................schema creation.............................
// const customerschema = new mongoose.Schema({
//     Name: {
//         type: String,
//         require: [true, 'A tour must have a name'],
//         unique: true
//     },
//     Phone: String
// })

// //............................collection creation..........................
// const Cust = mongoose.model("Cust", customerschema);

// console.log(app.get('env'));
// console.log(process.env);

//run server....
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`app running on port ${port}`);
    // logger.log('info', `app running on port ${port}`);
});