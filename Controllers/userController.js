const AppError = require("../utils/apperror");
const User = require("./../Models/userModel");
const catchAsync = require("./../utils/catchAsync");
const Audit = require("./../Models/auditModel");

const logger = require("./../logger");
const { createLogger, transports, format } = require("winston");
const { findById } = require("./../Models/userModel");
require("winston-mongodb");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const queryObj = { ...req.query }; //this '...' take all data out of the object.
  console.log(queryObj);
  const excludeFields = ["page", "sort", "limit", "fields"];
  excludeFields.forEach((el) => delete queryObj[el]);

  console.log(req.query); //this query will return an object
  console.log(queryObj);

  //1B) ADVANCE FILTERING
  let querystr = JSON.stringify(queryObj); //convert object to string
  querystr = querystr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  console.log(JSON.parse(querystr));

  let query = User.find(JSON.parse(querystr)); //this will return a query

  //2) SORTING(in sorting when we put "-" before any field in postman thats mean it'll sort in decending order)
  if (req.query.sort) {
    const sortby = req.query.sort.split(",").join(" ");
    console.log(sortby);
    query = query.sort(sortby);
  } else {
    query = query.sort("-createdAt");
  }

  //3) FIELD LIMITING (fields what we want to see in response)
  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    console.log(fields);
    query = query.select(fields);
  } else {
    query = query.select("-__v");
  }

  //4) PAGINATION
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  if (req.query.page) {
    const numCusts = await Cust.countDocuments();
    if (skip >= numCusts) {
      throw new Error("This page does not exist!!!");
    }
  }

  const usersdata = await query;

  //SEND RESPONSE
  res.status(200).json({
    status: "success",
    results: usersdata.length,
    data: {
      users: usersdata,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  //1)create error if user POST password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError("This route is not for upadte password!!!!", 400));
  }

  //2)filterout unwanted fields that are not allowed to be update
  const filterBody = filterObj(req.body, "name", "email");

  //3)update user data
  const upadteUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: upadteUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getUser = async (req, res) => {
  const query = User.find({ _id: req.params.id }).populate("history");
  // console.log(query);
  const user = await query;
  console.log(user);

  res.status(201).json({
    status: "success",
    user,
  });
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "the route is not yet define",
  });
};

exports.updateUser = catchAsync(async (req, res) => {
  //1)create error if user POST password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError("This route is not for upadte password!!!!", 400));
  }

  //2)Get data from body and params
  const id = req.params.id;
  let email = req.body.email;
  let name = req.body.name;

  //3)find previous data
  const previoususerdata = await User.findById(id);

  const data = req.body;

  //4)if value is not given in body then set previous data
  if (!data.email) {
    email = previoususerdata.email;
  }
  if (!data.name) {
    name = previoususerdata.name;
  }

  //5)update data
  const userupdate = await User.findByIdAndUpdate(
    id,
    {
      // $set: {
      name: name,
      email: email,
      history: req.body.history,
      updatedAt: Date.now(),
      //}
    },
    {
      new: true,
      runValidators: true,
    }
  );

  //6)add audit log
  if (req.body.name != previoususerdata.name && data.name) {
    await Audit.create({
      updateduserid: id,
      field: "name",
      oldvalue: previoususerdata.name,
      newvalue: req.body.name,
    });
  }
  if (req.body.email != previoususerdata.email && data.email) {
    await Audit.create({
      updateduserid: id,
      field: "email",
      oldvalue: previoususerdata.email,
      newvalue: req.body.email,
    });
  }

  //7)get audit data value and set it in perticular user history field
  // const auditdata = await Audit.find({ updateduserid: id });
  // console.log(auditdata);

  // const historyArr = []
  // auditdata.forEach(async (data) => {
  //     console.log(data._id);
  //     historyArr.push(data._id);

  //     await User.findByIdAndUpdate(id, {
  //         // $set: {
  //         history: historyArr
  //         //}
  //     })
  // })

  // userupdate.updatedAt = Date.now();
  res.status(201).json({
    status: "success",
    data: {
      userupdate,
    },
  });
});

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "the route is not yet define",
  });
};

exports.getUserByPreviousWeek = catchAsync(async (req, res) => {
  const todayDate = new Date().getDate();
  console.log(todayDate);

  const status = await User.aggregate([
    {
      $project: {
        //createdAt: { $dateToString: "$createdAt" },
        month: { $month: "$updatedAt" },
        day: { $dayOfMonth: "$updatedAt" },
        name: 1,
      },
    },
    {
      $match: {
        // month: { $eq: req.params.month * 1 },
        day: {
          $gte: todayDate - req.params.week * 1,
          $lte: todayDate,
        },
      },
    },
  ]);

  console.log(status);

  res.status(200).json({
    status: "success",
    message: "aggregation successful",
    data: {
      status,
    },
  });
});

exports.upsert = catchAsync(async (req, res) => {
  const name = req.params.name;

  const email = req.body.email;
  // const name = req.body.name;
  const status = await User.findOneAndUpdate(
    { name: name },
    { $set: { email: email, name: name } },
    { upsert: true, new: true, runValidators: true }
  );

  res.status(200).json({
    status: "success",
    message: "upsert successful",
    data: {
      status,
    },
  });
});
