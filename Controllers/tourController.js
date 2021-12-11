const AppError = require('../utils/apperror');
const Cust = require('./../Models/tourmodel');
const catchAsync = require('./../utils/catchAsync');
// const fs = require("fs");

// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev_data/data/tour.json`));

//.......................................MIDDLEWARES.....................................
//This middleware is to check if the requested id is valid or not....
// exports.checkid = (req, res, next, val) => {
//     console.log(`tour id is: ${val} from tourcontroller page`);
//     if (req.params.id * 1 > tours.length) {
//         return res.status(200).json({
//             status: 'fail',
//             data: {
//                 tour: "fail to check id"
//             }
//         })
//     }
//     next();
// };

//This middleware will check if the requested body is valid or not. If not then send a 404 error.....
// exports.checkbody = (req, res, next) => {
//     if (!req.body.id || !req.body.name) {
//         return res.status(404).json({
//             status: 'fail',
//             message: "mandetory fields are missing. Please give id and name"
//         })
//     }
//     next();
// };

class APIfeature {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }
    filter() {
        const queryObj = { ...this.queryString };//this '...' take all data out of the object.
        console.log(queryObj);
        const excludeFields = ['page', 'sort', 'limit', 'fields'];
        excludeFields.forEach(el => delete queryObj[el]);

        console.log(req.query);//this query will return an object
        console.log(queryObj);

        //1B) ADVANCE FILTERING
        let querystr = JSON.stringify(queryObj);//convert object to string
        querystr = querystr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        console.log(JSON.parse(querystr));

        this.query = this.query.Cust.find(JSON.parse(querystr));
        //let query = Cust.find(JSON.parse(querystr));//this will return a query
        return this;
    }
    sort() {
        if (this.queryString.sort) {
            const sortby = this.queryString.sort.split(',').join(' ');
            console.log(sortby);
            this.query = this.query.sort(sortby);
        } else {
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }
    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            console.log(fields);
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }
        return this;
    }
    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 10;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        // if (this.queryString.page) {
        //     const numCusts = await Cust.countDocuments();
        //     if (skip >= numCusts) {
        //         throw new Error('This page does not exist!!!');
        //     }
        // }
        return this;
    }

}

// const catchAsync = fn => {
//     return (req, res, next) => {
//         fn(req, res, next).catch(next)
//     };
// };

//.............................CONTROLLERS OR ROUTE HANDELLERS............................
exports.getAlltours = catchAsync(async (req, res, next) => {
    //this below code is for get all data fron tour file.....
    // return res.status(200).json({
    //     status: 'success',
    //     result: tours.length,
    //     data: {
    //         tours
    //     }
    // });

    //this code is for get all data from database.....
    //try {
    //.......BUILD QUERY.........
    //1A) FILTERING
    const queryObj = { ...req.query };//this '...' take all data out of the object.
    console.log(queryObj);
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach(el => delete queryObj[el]);

    console.log(req.query);//this query will return an object
    console.log(queryObj);

    //1B) ADVANCE FILTERING
    let querystr = JSON.stringify(queryObj);//convert object to string
    querystr = querystr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    console.log(JSON.parse(querystr));

    let query = Cust.find(JSON.parse(querystr));//this will return a query

    //2) SORTING(in sorting when we put "-" before any field in postman thats mean it'll sort in decending order)
    if (req.query.sort) {
        const sortby = req.query.sort.split(',').join(' ');
        console.log(sortby);
        query = query.sort(sortby);
    } else {
        query = query.sort('-createdAt');
    }

    //3) FIELD LIMITING (fields what we want to see in response)
    if (req.query.fields) {
        const fields = req.query.fields.split(',').join(' ');
        console.log(fields);
        query = query.select(fields);
    } else {
        query = query.select('-__v');
    }

    //4) PAGINATION
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    if (req.query.page) {
        const numCusts = await Cust.countDocuments();
        if (skip >= numCusts) {
            throw new Error('This page does not exist!!!');
        }
    }

    //const customersdata = await Cust.find(req.query);

    //EXECUTE QUERY
    //const features = new APIfeature(Cust.find(), req.query).filter().sort().limitFields().paginate();
    const customersdata = await query;

    //SEND RESPONSE
    res.status(200).json({
        status: 'success',
        results: customersdata.length,
        data: {
            customers: customersdata
        }
    });
    //}
    // catch (e) {
    //     res.status(404).json({
    //         status: 'fail to get',
    //         message: e
    //     });
    // }
});

exports.postData = catchAsync(async (req, res, next) => {
    //try {
    const addcustdata = await Cust.create(req.body);

    return res.status(201).json({
        status: 'success',
        data: {
            tour: addcustdata
        }
    })
    // } catch (e) {
    //     res.status(404).json({
    //         status: 'fail to post data!!',
    //         message: e
    //     });
    // }

    //.......below code is for post data to json file.......
    // const newid = tours[tours.length - 1].id + 1;
    // //console.log(req.body)

    // const newtour = Object.assign({ id: newid }, req.body);

    // tours.push(newtour);
    // fs.writeFile("tour.json", JSON.stringify(tours), err => {
    //     return res.status(201).json({
    //         status: 'success',
    //         data: {
    //             tour: newtour
    //         }
    //     })
    // })
});

exports.getTour = catchAsync(async (req, res, next) => {
    //try {
    const id = req.params.id;
    const findcustdata = await Cust.findById(id);

    if (!findcustdata) {
        return next(new AppError(`No tour found with this id ${id}`, 404));
    }

    return res.status(200).json({
        status: 'success',
        results: findcustdata.length,
        data: {
            findcustdata
        }
    })
    // } catch (e) {
    //     res.status(404).json({
    //         status: 'fail to get perticular data',
    //         message: e
    //     });
    // }

    // const id = req.params.id * 1;
    // console.log(`requested id from URL is ${id} from tourcontroller page in gettour method`);
    // const tour = tours.find(el => el.id === id);
    // return res.status(201).json({
    //     status: 'success',
    //     data: {
    //         tour
    //     }
    // })
});

exports.patchData = catchAsync(async (req, res, next) => {
    //try {
    const custupdate = await Cust.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    //await custupdate.save();

    if (!custupdate) {
        return next(new AppError(`No tour found with this id ${id}`, 404));
    }

    res.status(200).json({
        status: 'success',
        message: 'update successful',
        data: {
            custupdate
        }
    });
    // } catch (e) {
    //     res.status(404).json({
    //         status: 'fail to update',
    //         message: e
    //     });
    // }

    /*if (req.params.id * 1 < tours.length) {
        res.status(200).json({
            status: 'success',
            data: {
                tour: "update tour"
            }
        })
    }*/

});

exports.deleteData = catchAsync(async (req, res, next) => {
    //try {
    const custdelete = await Cust.findByIdAndDelete(req.params.id, req.body);

    if (!custdelete) {
        return next(new AppError(`No tour found with this id ${id}`, 404));
    }

    //rthe status has to be 204. if not then after deletion, deleted data will be shown....
    res.status(204).json({
        status: 'success',
        message: 'delete successful',
        data: {
            custdelete
        }
    });
    // } catch (e) {
    //     res.status(404).json({
    //         status: 'fail to delete',
    //         message: e
    //     });
    // }
});

exports.getCustStatus = catchAsync(async (req, res, next) => {
    //try {
    const status = await Cust.aggregate([
        {
            $project: {
                //createdAt: { $dateToString: "$createdAt" },
                month: { $month: "$createdAt" },
                day: { $dayOfMonth: "$createdAt" },
                name: 1

            }
        },
        {
            $match: {
                month: { $eq: req.params.month * 1 },
                day: { $eq: req.params.day * 1 }

            }
        }
    ]);
    console.log(status)
    // for (var i = 0; i < 10; i++) {
    //     console.log(status[i].month);
    // }

    res.status(200).json({
        status: 'success',
        message: 'aggregation successful',
        data: {
            status
        }
    });
    // } catch (e) {
    //     res.status(404).json({
    //         status: 'fail in aggregation',
    //         message: e
    //     });
    // }
});

exports.getMOnthlyPlane = catchAsync(async (req, res, next) => {
    //try {
    const year = req.params.year * 1;

    const plan = await Cust.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $project: {
                name: 1,
                startDates: 1
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' }
            }
        }
    ]);

    res.status(200).json({
        status: 'success',
        results: plan.length,
        message: 'aggregation successful',
        data: {
            plan
        }
    });

    // } catch (e) {
    //     res.status(404).json({
    //         status: 'fail in aggregation',
    //         message: e
    //     });
    // }
});