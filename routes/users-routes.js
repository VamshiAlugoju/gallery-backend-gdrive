const  express = require("express");
const router  = express.Router();
const {check} = require("express-validator")
const middleware = require("../middleware/file-upload")
const UserControllers = require("../controllers/user-controllers.js")
const multer = require("multer")
const upload = multer({dest:"uploads/"})


router.get("/" , UserControllers.getallUsers)

router.post("/signUp",  
      upload.single("image"),
[
    check("id").not().isEmpty(),
    check("name").not().isEmpty(),
    check("email").not().isEmpty(),
    check("Password").isLength({min:8})
],UserControllers.signUp)

router.post("/login",[
    
    check("email").not().isEmpty(),
    check("password").not().isEmpty()
],UserControllers.Login)

module.exports = router