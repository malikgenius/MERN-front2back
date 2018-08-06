//node scheduler to send sms and emails...
const schedule = require("node-schedule");
const Profile = require("../model/Profile");
const moment = require("moment");
const nodemailer = require("nodemailer");
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

module.exports = schedule.scheduleJob("* * * * *", () => {
  // console.log("Schedule Working");
  // get current date and then change it into unix date. to compare with saved date in DB.
  const currentDate = moment(new Date()).format("MM/DD/YYYY");
  const unixTime = parseInt(
    (new Date(currentDate).getTime() / 1000).toFixed(0)
  );
  // now add days in todays date to match with saved birthday to send email specific days in Advance.
  const oneDayAdvance = moment()
    .add(1, "days")
    .format("MM/DD/YYYY");
  // change ondDayAdvance to unix date, which is tomorrow to match the Tomorrows date in DB.
  // if oneDayAdvance is equal to tomorrows date send an advance Email to User.
  const oneDayEarlierUnix = parseInt(
    (new Date(oneDayAdvance).getTime() / 1000).toFixed(0)
  );

  // Testing Days10Advance to check if we can send an email 10 Days before the bday.
  const Days10Advance = moment()
    .add(10, "days")
    .format("MM/DD/YYYY");

  const Day10EarlierUnix = parseInt(
    (new Date(Days10Advance).getTime() / 1000).toFixed(0)
  );

  // Testing Days30Advance to check if we can send an email 10 Days before the bday.
  const Days30Advance = moment()
    .add(30, "days")
    .format("MM/DD/YYYY");

  const Day30EarlierUnix = parseInt(
    (new Date(Days30Advance).getTime() / 1000).toFixed(0)
  );

  console.log(oneDayEarlierUnix);
  console.log(Day10EarlierUnix);
  console.log(Day30EarlierUnix);
  // We Can use this same function to send emails to different users for different dates of birth or anything else .. will checek more.
  Profile.find({ birthday: Day30EarlierUnix, birthday: oneDayEarlierUnix })
    .populate("user", ["email", "name"])
    .then(profile => {
      if (profile) {
        profile.forEach(single => {
          const userObj = single.user;
          const email = userObj.email;
          const userName = userObj.name;
          const userBD = single.birthday;
          // if (userBD === oneDayEarlierUnix) {
          //   return console.log(`OneDayEarlier worked ${oneDayEarlier}`);
          // }
          // return console.log(` OneDayEarlier worked ${userBD}`);
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
            // Emails List ...
            var maillist = [
              email
              // "malik@tbwazeenah.com",
              // "linuxgen2016@gmail.com"
            ];

            // setup email data with unicode symbols
            let mailOptions = {
              from: '"ZEENAH HR" <pooja@zeenah.com>', // sender address
              to: maillist, // list of receivers
              subject: "ZEENAH TEAM WISHES YOU BIRTHDAY", // Subject line
              text: `Hello ${userName}`, // plain text body
              html: `<b>Advance Happy Birthday for ${moment
                .unix(userBD)
                .format("MM/DD/YYYY")} to ${userName}</b>` // html body
            };
            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                return console.log(error);
              }
              console.log("Message sent: %s", info.messageId);
              console.log(`message sent to ${emailTo}`);
              console.log(
                "Preview URL: %s",
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
