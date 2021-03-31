import express from "express";
import { fileModel } from "../models/files";
import { upload } from "../config/storage";
import { sendMail } from "../config/nodemailer";
const { v4: uuidv4 } = require("uuid");

const fileRoute = express.Router();

fileRoute.post("/", (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(500).send({ error: err.message });
      }
      const file = new fileModel({
        filename: req.file.filename,
        uuid: uuidv4(),
        path: req.file.path,
        size: req.file.size,
      });
      const response = await file.save();
      return res.json({
        file: `${process.env.APP_BASE_URL}/api/files/${response.uuid}`,
      });
    });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

//share the link by email

fileRoute.post("/send", async (req, res) => {
  const { uuid, emailTo, emailFrom } = req.body;
  if (!uuid || !emailTo || !emailFrom) {
    return res
      .status(422)
      .send({ error: "All fields are required except expiry." });
  }
  // Get data from db
  try {
    const file = await fileModel.findOne({ uuid: uuid });
    if (file.sender) {
      return res.status(422).send({ error: "Email already sent once." });
    }
    file.sender = emailFrom;
    file.receiver = emailTo;
    const response = await file.save();
    // send mail
    sendMail({
      from: emailFrom,
      to: emailTo,
      subject: "cloudShare file sharing",
      text: `${emailFrom} shared a file with you.`,
      htmlTo: require("../email_template/template_to")({
        emailFrom,
        downloadLink: `${process.env.APP_BASE_URL}/api/files/${file.uuid}?source=email`,
        expires: "24 hours",
      }),
      htmlFrom :require("../email_template/template_from")({
        emailFrom,
        downloadLink: `${process.env.APP_BASE_URL}/api/files/${file.uuid}?source=email`,
        expires: "24 hours",
      }),
    })
      .then(() => {
        return res.json({ success: true });
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json({ error: "Error in email sending." });
      });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ error: "Something went wrong." });
  }
});

//get downloadable link
fileRoute.get("/:uuid", async (req, res) => {
  try {
    const file = await fileModel.findOne({ uuid: req.params.uuid });
    // Link expired
    if (!file) {
      return res
        .status(422)
        .send({ error: "File has been removed as the link expires" });
    }
    return res.json({
      uuid: file.uuid,
      fileName: file.filename,
      fileSize: file.size,
      downloadLink: `${process.env.APP_BASE_URL}/api/files/download/${file.uuid}`,
    });
  } catch (err) {
    return res.status(500).send({ error: "Something went wrong." });
  }
});


//download file

fileRoute.get('/download/:uuid', async (req, res) => {
  // Extract link and get file from storage send download stream 
  const file = await fileModel.findOne({ uuid: req.params.uuid });
  // Link expired
  if(!file) {
       return res
       .status(422)
       .send({ error:  'Link has been expired.' });
  } 
  const response = await file.save();
  const filePath = `${__dirname}/../${file.path}`;
  res.download(filePath);
});
module.exports = fileRoute;
