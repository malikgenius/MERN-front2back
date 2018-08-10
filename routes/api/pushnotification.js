const express = require('express');
const router = express.Router();
const Profile = require('../../model/Profile');
const moment = require('moment');
const schedule = require('node-schedule');
const webpush = require('web-push');
const publicVapidKey = require('../../config/Keys').publicVapidKey;
const privateVapidKey = require('../../config/Keys').privateVapidKey;
// const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
// const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

// Replace with your email
webpush.setVapidDetails(
  'mailto:linuxgen2016@gmail.com',
  publicVapidKey,
  privateVapidKey
);

// // route /subscribe for push notifications... we can move it to its own file once test is done.
// router.post('/subscribe', (req, res) => {
//   const subscription = req.body;
//   console.log(req.body);
//   res.status(201).json({});
//   // here we can send whatever we want to push notification ... even we can trigger it on event. will figure it out how to .. but data we can send
//   // like if someone posted a new story, or somebody`s birthday today.
//   const payload = JSON.stringify({
//     title: 'WEB PUSH FROM NODE',
//     body: 'this is my birthday wish me please'
//   });
//   console.log(subscription);
//   if (2 === 2) {
//     webpush.sendNotification(subscription, payload).catch(error => {
//       console.error(error.stack);
//     });
//   }
// });

// Send Push Notifications on Birthdays ...

// current date in human readable format to compare with saved date in mongodb.
const currentDate = moment(new Date()).format('MM/DD/YYYY');
// Change time into UnixTimeStamp
var dateString = moment.unix(currentDate).format('MM/DD/YYYY');
// current date into unix converter....
const unixTime = parseInt((new Date(currentDate).getTime() / 1000).toFixed(0));
// Now start the Push route and Profile.find if someones birthday today ..
router.post('/subscribe', (req, res) => {
  const subscription = req.body;
  console.log(req.body);
  res.status(201).json({});
  // here we can send whatever we want to push notification ... even we can trigger it on event. will figure it out how to .. but data we can send
  // like if someone posted a new story, or somebody`s birthday today.
  // have to figure out how to convert unixdate and match it with today...
  Profile.find({ birthday: currentDate })
    .populate('user', ['email', 'name'])
    .then(profile => {
      if (profile) {
        profile.forEach(single => {
          console.log(single);
          const userObj = single.user;
          const email = userObj.email;
          const userName = userObj.name;

          const payload = JSON.stringify({
            title: `Wishing ${userName}`,
            body: `Happy Birthday ${userName}, have a Great Year Ahead!`
          });
          console.log(subscription);
          webpush.sendNotification(subscription, payload).catch(error => {
            console.error(error.stack);
          });
        });
      }
    });
});

module.exports = router;
