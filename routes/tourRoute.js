const express = require("express");

const tourController = require("./../Controllers/tourController");
const authController = require('./../Controllers/authController');
/*const fs = require("fs");

const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev_data/data/tour.json`));

//CONTROLLERS OR ROUTE HANDELLERS.....
const getAlltours = (req, res) => {
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

const router = express.Router();//create a router....

//Middleware to check there is an id given in req URL on router......
//router.param('id', tourController.checkid);

router.route('/cust-status/:month,:day').get(tourController.getCustStatus);
router.route('/monthly-plan/:year').get(tourController.getMOnthlyPlane);

router.route('/').get(/*authController.protect,*/ tourController.getAlltours).post(tourController.postData);
router.route('/:id').get(tourController.getTour).patch(tourController.patchData)
    .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteData);

module.exports = router;