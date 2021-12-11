const express = require("express");
const cors = require("cors");
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const cookieParser = require('cookie-parser');

const appError = require('./utils/apperror');
const globalErrorContoler = require('./Controllers/errorControler');
const tourRouter = require("./routes/tourRoute");
const userRouter = require("./routes/userRoute");
const viewRouter = require("./routes/viewRoute");

const app = express();
app.use(cors());

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//...................MIDDLEWARES.....................

//serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    console.log(req.headers);
    next();
});

app.use(helmet());

//Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

//Data sanitization against NoSQL query injection
app.use(mongoSanitize());// It remove all '$' sign from the requested body

//Data sanitize against xss
app.use(xssClean());

//Prevent parameter polution
app.use(hpp({
    whitelist: ['duration', 'ratingsAvarage', 'ratingsQuantity', 'maxGroupSize', 'price', 'difficulty']
}));

//Test middleware
app.use((req, res, next) => {
    console.log(`hellow from middleware...`);
    // console.log(req.cookies);
    next();
});

//read the file....
//const tours = JSON.parse(fs.readFileSync("tour.json"));

//route handlers or controllers.....
/*const getAlltours = (req, res) => {
    res.status(200).json({
        status: 'success',
        result: tours.length,
        data: {
            tours
        }
    });
};

const postData = (req, res) => {
    const newid = tours[tours.length - 1].id + 1;
    //console.log(req.body)

    const newtour = Object.assign({ id: newid }, req.body);

    tours.push(newtour);
    fs.writeFile("tour.json", JSON.stringify(tours), err => {
        res.status(201).json({
            status: 'success',
            data: {
                tour: newtour
            }
        })
    })
};

const getTour = (req, res) => {
    const id = req.params.id * 1;
    console.log(id);
    const tour = tours.find(el => el.id === id);
    res.status(201).json({
        status: 'success',
        data: {
            tour
        }
    })
};

const patchData = (req, res) => {
    if (req.params.id * 1 < tours.length) {
        res.status(200).json({
            status: 'success',
            data: {
                tour: "update tour"
            }
        })
    }
    res.json({
        status: 'fail',
        data: {
            tour: "fail to update tour"
        }
    })
};

const deleteData = (req, res) => {
    if (req.params.id * 1 < tours.length) {
        res.status(200).json({
            status: 'success',
            data: {
                tour: "delete tour"
            }
        })
    }
    res.json({
        status: 'fail to delete',
        data: null
    })
};*/

//get all data....
//app.get('/api/v1/tours', getAlltours);
//get by id....
//app.get('/api/v1/tours/:id', getTour);
//add new data....
//app.post('/api/v1/tours', postData);
//patch ....
//app.patch('/api/v1/tours/:id', patchData);
//delete .....
//app.delete('/api/v1/tours/:id', deleteData);

//ALL ROUTES......
/*const tourRouter = express.Router();//create a router....

tourRouter.route('/').get(getAlltours).post(postData);
tourRouter.route('/:id').get(getTour).patch(patchData).delete(deleteData);*/

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);//create a middleware to use router....
app.use('/api/v1/users', userRouter);

//this route is for those url's whixh we've not initialise
app.all('*', (req, res, next) => {
    // res.status(404).json({
    //     status: 'fail',
    //     message: `can't find '${req.originalUrl}' on this server!!!`
    // });

    // const err = new Error(`can't find '${req.originalUrl}' on this server!!!`);
    // err.status = 'fail';
    // err.statusCode = 404;

    next(new appError(`can't find '${req.originalUrl}' on this server!!!`, 404));
});

//Global error handeler
app.use(globalErrorContoler);

//run server....
/*const port = 3000;
app.listen(port, () => {
    console.log(`app running on port ${ port }`);
});*/

module.exports = app;