const nodemailer = require('nodemailer');
const emailUser = require('../config/Keys').emailUser;
const emailPass = require('../config/Keys').emailPass;
// ('use strict');
// const nodemailer = require('nodemailer');

// Generate test SMTP service account from ethereal.email
// Only needed if you don't have a real mail account for testing
nodemailer.createTestAccount((err, account, emailTo) => {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    // secure: false, // true for 465, false for other ports
    auth: {
      user: emailUser, // generated ethereal user
      pass: emailPass // generated ethereal password
    },
    tls: {
      ciphers: 'SSLv3'
    }
  });

  // setup email data with unicode symbols
  let mailOptions = {
    from: '"ZEELIST" <pooja@zeenah.com>', // sender address
    to: emailTo, // list of receivers
    subject: 'ZEELIST SERVER STARTED', // Subject line
    text: 'HELLO ADMIN', // plain text body
    html: '<b>Hello world?</b>' // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  });
});

// var transporter = nodemailer.createTransport({
//   host: "smtp.office365.com", // Office 365 server
//   port: 587, // secure SMTP
//   requireTLS: true,
//   secure: false, // false for TLS - as a boolean not string - but the default is false so just remove this completely
//   auth: {
//     user: username,
//     pass: password
//   },
//   tls: {
//     ciphers: "SSLv3"
//   }
// });
