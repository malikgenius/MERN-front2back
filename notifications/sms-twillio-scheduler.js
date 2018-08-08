//node scheduler to send sms...
const schedule = require('node-schedule');
const Profile = require('../model/Profile');
const User = require('../model/User');
const moment = require('moment');
const twilioAccountSid = require('../config/Keys').twilioAccountSid;
const twilioAuthToken = require('../config/Keys').twilioAuthToken;
const client = require('twilio')(twilioAccountSid, twilioAuthToken);

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
  // get current date and then change it into unix date. to compare with saved date in DB.
  const currentDate = moment(new Date()).format('MM/DD/YYYY');
  const unixTime = parseInt(
    (new Date(currentDate).getTime() / 1000).toFixed(0)
  );

  Profile.find({ birthday: unixTime })
    .populate('user', ['phone', 'email', 'name'])
    .then(profile => {
      if (profile) {
        profile.forEach(single => {
          const userObj = single.user;
          const email = userObj.email;
          const userName = userObj.name;
          const phone = `+968${userObj.phone}`;
          // Twilio Code Starts below...
          const opts = {};
          opts.body = `Happy Birthday ${userName}, ZEENAH wishes you All the Happiness! `;
          opts.from = +18592096950;
          opts.to = phone;
          client.messages
            .create(opts)
            // .then(message => {
            //   res.json(message);
            // })
            .then(message => console.log(message.sid))
            // .then(res.send(message))
            .done();
        });
        return console.log('Messag Sent');
      } else {
        return console.log('Couldnt find any current');
      }
    });
});
