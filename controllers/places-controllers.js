const { validattionResult } = require("express-validator");
const HttpError = require("../models/HttpError");
const getCoordinates = require("../util/location");
const Place = require("../models/place");
const User = require("../models/user");
const mongoose = require("mongoose")
const fs = require("fs")
 const middlewares = require("../middleware/file-upload")

const getPlacebyId = async (req, res, next) => {

  const key = req.params.uid
  const placeId = req.params.uid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError("could not find a place", 500);
    return next(error);
  }

  if (!place) {
    const error = new HttpError(
      "could not find  a place for the provided id",
      404
    );
    return next(error);
  }
  res.json({ place: place.toObject({ getters: true }) });
};



const getPlacebyuserId = async (req, res, next) => {
 
  const userId = req.params.pid;
  
  let place;
  try {
    place = await Place.find({ creator: userId });
  } catch (err) {
    const error = new HttpError("could not find a place", 400);
    console.log(err);
    return next(error);
  }

  if (!place) {
    const error = new HttpError(
      "could not find  a place for the provided id",
      404
    );
    return next(error);
  }
  res.json({ place });
};



const createPlace = async (req, res, next) => {
  // const errors = validattionResult(req)
  // if(!errors.isEmpty){
  //     throw new HttpError("invalid inputs" , 402)
  // }
    const file = req.file
    console.log(file)
     let result
    try{
       result = await middlewares.uploadtoDrive(file)
        console.log(result)
    }catch(err){
      console.log(err)
    }
  const { title, description, address, creator } = req.body;

  let coordinates;

  try {
    coordinates = await getCoordinates(address);
  } catch (error) {
    console.log(error);
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image:result,
    creator
  });
 
  let user;
  
  try {
    user = await User.findById(creator);
  } catch (err) {
    return next(new HttpError("the user is invalid"), 409);
  }
  
  if (!user) {
    return next(new HttpError("the user is not found in db"), 404);
  }
   console.log(user , createdPlace)
 
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    await user.places.push(createdPlace); // push is not a usual javascript array method here its a mongoose method
    await user.save({ session: sess });
    await sess.commitTransaction();
     console.log("pushed")
  } catch (err) {
      console.log(err)
    const error = new HttpError("hello this is an error", 406);
    return next(error);
  }
   
  res.json(createdPlace);
};



const updatePlace = async (req, res, next) => {
 
  // const errors = validattionResult(req)
  // if(!errors.isEmpty()){
  //     throw new HttpError("invalid inputs",560)
  // }
  const placeId = req.params.pid;
  const { title, description } = req.body;

  let updatedPlace;
  try {
    updatedPlace = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(" the place with the id is not found ", 404);
    return next(error);
  }
  updatedPlace.title = title;
  updatedPlace.description = description;
  updatedPlace
    .save()
    .then(() => {
      console.log("updated success fully");
    })
    .catch((err) => {
      console.log(err);
    });
  res.json({ updatedPlace });
};



const DeletePlace = async (req, res, next) => {

  const placeId = req.params.pid;

  let place;
  let key ;
  try {
    place = await Place.findById(placeId);
     key = place.image;
  } catch (err) {
    const error = new HttpError("the place could not be found", 404);
    return next(error);
  }
   
  
  let user;
  try{
    user  = await User.findById(place.creator)
  }catch(err){
    return next(new HttpError("error occured during findning user") , 506)
  }

  if(!user)
  {
    return next(new HttpError("the user is not found") , 404)
  }
   
   
  try {
    const sess = await mongoose.startSession()
    sess.startTransaction()
    await place.remove({session:sess});
     await user.places.pull(place)
     await user.save({session:sess})
     await sess.commitTransaction()
  } catch (err) {
    const error = new HttpError("the place could not be deleted", 404);
    return next(error);
  }

  let deleteOperation;
  try{
    // deleteOperation = await middlewares.deletefile(key)
  }
  catch(err){
      console.log( "the error is ", err)
  }
  fs.unlink( "uploads/"+key,err=>{console.log(err)})

  res.status(200).json(place);
};



exports.getPlacebyId = getPlacebyId;
exports.getPlacebyuserId = getPlacebyuserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.DeletePlace = DeletePlace;
