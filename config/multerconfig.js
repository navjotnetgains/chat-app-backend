import multer from 'multer'
import {CloudinaryStorage} from 'multer-storage-cloudinary'
import dotenv from "dotenv";
dotenv.config();
import cloudinary from './cloudinary.js'


const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params:{
        allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
    },
});


const upload = multer({storage:storage});

export default upload;