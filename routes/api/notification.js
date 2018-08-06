const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const Joi = require("joi");
const ProfileValidation = require("./ProfileValidation-Joi");
const nodemailer = require("nodemailer");

// Email to User

router.post("/email", (req, res) => {
  const emailTo = req.body.email;
  // node Mailer function ..
  nodemailer.createTestAccount((err, account) => {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      // secure: false, // true for 465, false for other ports
      auth: {
        user: "pooja@zeenah.com", // generated ethereal user
        pass: "Verma@zee" // generated ethereal password
      },
      tls: {
        ciphers: "SSLv3"
      }
    });
    // setup email data with unicode symbols
    let mailOptions = {
      from: '"Fred Foo 👻" <pooja@zeenah.com>', // sender address
      to: emailTo, // list of receivers
      subject: "ZEELIST SERVER STARTED", // Subject line
      text: "HELLO ADMIN", // plain text body
      html: "<b>Hello world?</b>" // html body
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      res.json(info);
      console.log("Message sent: %s", info.messageId);
      console.log(`message sent to ${emailTo}`);
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    });
  });
});

//SMS To User Phone
router.post("/sms", (req, res) => {
  const accountSid = "ACee445774dc3949bcc2d5efee8e2ca70f";
  const authToken = "4b87e6a635aea42b6c66a10333e554f3";
  const client = require("twilio")(accountSid, authToken);
  const opts = {};
  opts.body = "This is my test sms from twilio";
  opts.from = +18592096950;
  opts.to = req.body.phone;
  client.messages
    .create(opts)
    .then(message => {
      res.json(message);
    })
    // .then(message => console.log(message.sid))
    // .then(res.send(message))
    .done();
});

module.exports = router;
