import express from 'express'
import {fileModel} from '../models/files'
import {upload} from '../config/storage'
import { sendMail } from "../config/nodemailer";
const { v4: uuidv4 } = require('uuid');

 const fileRoute = express.Router()

fileRoute.post('/', (req, res)=>{

try {
    upload(req, res, async (err) => {
        if (err) {
          return res.status(500).send({ error: err.message });
        }
          const file = new fileModel({
              filename: req.file.filename,
              uuid: uuidv4(),
              path: req.file.path,
              size: req.file.size
          });
          const response = await file.save();
          return res.json({ file: `${process.env.APP_BASE_URL}/files/${response.uuid}` });
        });
} catch (error) {
    return res.status(500).send({ error: error.message });
}

})


fileRoute.post('/send', async (req, res) => {
    const { uuid, emailTo, emailFrom, expiresIn } = req.body;
    if(!uuid || !emailTo || !emailFrom) {
        return res.status(422).send({ error: 'All fields are required except expiry.'});
    }
    // Get data from db 
    try {
      const file = await fileModel.findOne({ uuid: uuid });
      if(file.sender) {
        return res.status(422).send({ error: 'Email already sent once.'});
      }
      file.sender = emailFrom;
      file.receiver = emailTo;
      const response = await file.save();
      // send mail
      sendMail({
        from: emailFrom,
        to: emailTo,
        subject: 'cloudShare file sharing',
        text: `${emailFrom} shared a file with you.`,
        html: require('../email_template/template')({
                  emailFrom, 
                  downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}?source=email` ,
                  expires: '24 hours'
              })
      }).then(() => {
        return res.json({success: true});
      }).catch(err => {
        return res.status(500).json({error: 'Error in email sending.'});
      });
  } catch(err) {
    return res.status(500).send({ error: 'Something went wrong.'});
  }
  
  });
    module.exports = fileRoute;