//node scheduler to send sms and emails...
const schedule = require('node-schedule');
const Profile = require('../model/Profile');
const moment = require('moment');
const nodemailer = require('nodemailer');
const emailUser = require('../config/Keys').emailUser;
const emailPass = require('../config/Keys').emailPass;
/*
*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    │
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, OPTIONAL)
*/

module.exports = schedule.scheduleJob('* * 23 * *', () => {
  // console.log("Schedule Working");
  // get current date and then change it into unix date. to compare with saved date in DB.
  const currentDate = moment(new Date()).format('MM/DD/YYYY');
  const unixTime = parseInt(
    (new Date(currentDate).getTime() / 1000).toFixed(0)
  );
  Profile.find({ birthday: unixTime })
    .populate('user', ['email', 'name'])
    .then(profile => {
      if (profile) {
        profile.forEach(single => {
          const userObj = single.user;
          const email = userObj.email;
          const userName = userObj.name;
          nodemailer.createTestAccount((err, account) => {
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
            // Emails List ...
            var maillist = [
              email,
              'malik@tbwazeenah.com',
              'linuxgen2016@gmail.com'
            ];

            // setup email data with unicode symbols
            let mailOptions = {
              from: '"ZEENAH HR" <pooja@zeenah.com>', // sender address
              to: maillist, // list of receivers
              subject: 'ZEENAH TEAM WISHES YOU BIRTHDAY', // Subject line
              text: `Hello ${userName}`, // plain text body
              html: `<b>Happy Birthday ${userName}</b>` // html body
            };
            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                return console.log(error);
              }
              console.log('Message sent: %s', info.messageId);
              console.log(`message sent to ${emailTo}`);
              console.log(
                'Preview URL: %s',
                nodemailer.getTestMessageUrl(info)
              );
              res.json(info);
            });
          });
          // return console.log(email);
        });
        // return console.log(profile);
        // const userObj = profile[0].user;
        // const email = userObj.email;
        // const userName = userObj.name;
        // return console.log(email);
      }
      // return console.log("Couldnt find any current");
    });
});
