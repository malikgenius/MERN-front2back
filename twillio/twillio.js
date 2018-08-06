// Number : +18592096950

// Download the helper library from https://www.twilio.com/docs/node/install
// Your Account Sid and Auth Token from twilio.com/console
const accountSid = "ACee445774dc3949bcc2d5efee8e2ca70f";
const authToken = "4b87e6a635aea42b6c66a10333e554f3";
const client = require("twilio")(accountSid, authToken);
const opts = {};
opts.body = "This is my test sms from twilio";
opts.from = +15017122661;
opts.to = req.body.phone;
client.messages
  .create(opts)
  .then(message => console.log(message.sid))
  .done();

module.exports = client(phone);
