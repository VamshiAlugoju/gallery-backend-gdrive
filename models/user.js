const mongoose = require("mongoose")
const schema = mongoose.Schema;
const uniqueValidator = require("mongoose-unique-validator")

const userSchema = new schema({
    name:{type:String , required:true},
    Email:{type:String , required:true , unique:true},
    password:{type:String , required:true},
    image:{type:String , required:true},
    places:[{type:mongoose.Types.ObjectId , required:true , ref:"Place"}]
})

//schema is declaration of a document it provide how the document should look like

  userSchema.plugin(uniqueValidator)

  module.exports = mongoose.model("User" , userSchema)  
  // model is an instance of document schema 
