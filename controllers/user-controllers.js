const {validationResult} = require("express-validator")
const HttpError = require("../models/HttpError")
const User = require("../models/user")
 const bcrypt =  require("bcryptjs")
const jwt = require("jsonwebtoken")
const middleware = require("../middleware/file-upload")

const getallUsers =async (req,res,next)=>{
       
   let allUsers;
   try{
    allUsers = await User.find({},"-password")
   }
   catch(err){
    return next(new HttpError("cannot found users in the database"),406)
   }
   
   if(allUsers)
   res.json({allUsers:allUsers.map(p=> p.toObject({getters:true})
   )})
   else 
   res.json({message:"no users found"})
   
}

const signUp = async (req,res,next)=>{
     
    // const errors = validationResult(req)
    // if(!errors.isEmpty())
    // {
    //     const error= new HttpError("invalid result",456)
    //     return next(error)
    // }
     const {name,email,password} = req.body
       
     let uploadimg; 

     try{
      uploadimg = await middleware.uploadtoDrive(req.file)
     }catch(err)
     {
         console.log(err)
     }
      
      let hasuser;
      try{  
         hasuser = await User.findOne({Email:email})
      }catch(err){
        const error = new HttpError(" sign up failed")
      }
     if(hasuser)
     {
        const error = new HttpError("email already in use please")
        return next(error)
     }
      let hashedPassword ;
      try{
         hashedPassword = await bcrypt.hash(password,12)
      }
      catch(err){
         return next(new HttpError("password cannot be hashed" , 500))
      }
      let newUser = new User( {
        name:name,
        Email:email,
        password:hashedPassword,
        image:uploadimg,
        places:[]
      })
     
     try{
     
       await newUser.save().then(()=>console.log(" saving succes")).catch(err=>console.log(err))
     } catch(err)
     {
        const error = new HttpError(" couldn't add the user")
        return next(error)
     }

     let token;
        try{
        token = jwt.sign({userId:newUser._id,email:newUser.Email}
               , "super_secret_key",
                {expiresIn:"1h"});
          }catch(err){
            const error = new HttpError(" couldn't add the user",500)
            return next(error)
          }
               

      res.json({userId:newUser._id , email:newUser.Email,token:token , name:newUser.name})
      
}
 


const Login = async(req,res,next)=>{

    const errors = validationResult(req)
    if(!errors.isEmpty())
    {
        return next( new HttpError("invalid inputs",456))
    }
     
    const {email,password} = req.body

    let user;
    try{
       user =  await User.findOne({Email:email})
    }catch(err){
        const error = new HttpError("user is not found " , 404)
        return next(error)
    }


    let validPassword = false;
     
    try{
       validPassword = await bcrypt.compare(password , user.password)
    }
    catch(err){
      return next(new HttpError("password in not matching please try again" , 500))
    }

    if(!validPassword){
         return next(new HttpError("password in not matching " , 401))
    }
   
      
    let token;
    try{
    token = jwt.sign({userId:user._id,email:user.Email}
           , "super_secret_key",
            {expiresIn:"1h"});
      }catch(err){
        const error = new HttpError(" couldn't login  the user",500)
        return next(error)
      }

    res.json({userId:user._id,
      email:user.Email,
      name:user.name,
      token:token}
      )
    
}

 
exports.getallUsers = getallUsers
exports.signUp = signUp
exports.Login = Login