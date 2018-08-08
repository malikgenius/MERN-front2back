const twilioAccountSid = require('../config/Keys').twilioAccountSid;
const twilioAuthToken = require('../config/Keys').twilioAuthToken;

// Download the helper library from https://www.twilio.com/docs/node/install
// Your Account Sid and Auth Token from twilio.com/console

const client = require('twilio')(twilioAccountSid, twilioAuthToken);
const opts = {};
opts.body = 'This is my test sms from twilio';
opts.from = +15017122661;
opts.to = req.body.phone;
client.messages
  .create(opts)
  .then(message => console.log(message.sid))
  .done();

module.exports = client(phone);
