const  express = require("express");
const routes  = express.Router();
const {check} = require("express-validator")
// const HttpError = require("../models/HttpError.js")
const fileupload = require("../middleware/file-upload")
const place_contollers  =  require("../controllers/places-controllers.js");
 const checkauth = require("../middleware/check.js")
 const multer = require("multer")
 const upload = multer({dest:"uploads/"})
 const middleware = require("../middleware/file-upload")


routes.get("/:uid",place_contollers.getPlacebyId)
routes.get("/user/:pid", place_contollers.getPlacebyuserId)

routes.use(checkauth)
routes.post("/",
upload.single("image"),
[
    check("title").not().isEmpty(),
    check("description").isLength({man:5}),
    check("address").not().isEmpty()
] , place_contollers.createPlace)

routes.patch("/:pid" , [
    check("title").not().isEmpty(),
    check("description").isLength({min:5})
] ,place_contollers.updatePlace)

routes.delete("/:pid",place_contollers.DeletePlace)

module.exports = routes;
