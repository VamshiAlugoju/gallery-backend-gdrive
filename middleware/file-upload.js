 const multer = require("multer")
const { v4 } = require("uuid")
 const {uuid} = require("uuidv4")
 const {S3} = require("aws-sdk")
 const dotenv = require("dotenv")
  const fs = require("fs")
  const {google} = require("googleapis")
 const env = dotenv.config().parsed
 const bucket ="vamshi224"
 const accesskey = "AKIAZLZBKZ5EB7QLR52S"
 const secretkey  ="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"
 const region = "ap-south-1"

 const googeldrivefolder ="11j7VZL0O9rhX6XdyQYGCJCBIcEUuuxeh" 
 
const MIME_TYPE_MAP = {
    'image/png':'png', 
    'image/jpeg':'jpeg',
    'image/jpg':'jpg',
}


 async function uploadtoDrive(file)
  {
      console.log(file)
     
    try{
        const auth = new google.auth.GoogleAuth({
            keyFile:"middleware/google-drive.json",
            scopes:["https://www.googleapis.com/auth/drive"]
        })

        const driveService =  google.drive({
            version:"v3",
            auth
        }) 
        
       
        const filemetadata= {
            name:file.filename,
            "parents":[googeldrivefolder]
        }

        const mime_type= MIME_TYPE_MAP[file.mime_type]
        const fileStream = fs.createReadStream(file.path)

        const media = {
            MimeType:mime_type,
            body:fileStream
        }

        const response = await driveService.files.create({
            resource:filemetadata,
            media:media,
            field:"id"
        })


        return response.data.id;
    }catch(err)
    {
        console.log(err)
    }

  }
  

exports.uploadtoDrive = uploadtoDrive
 