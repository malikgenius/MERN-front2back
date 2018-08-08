const express = require('express');
const router = express.Router();
const webpush = require('web-push');
const publicVapidKey = require('../../config/Keys').publicVapidKey;
const privateVapidKey = require('../../config/Keys').privateVapidKey;
// const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
// const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

// Replace with your email
webpush.setVapidDetails(
  'mailto:malikgen2010@gmail.com',
  publicVapidKey,
  privateVapidKey
);
// route /subscribe for push notifications... we can move it to its own file once test is done.
router.post('/subscribe', (req, res) => {
  const subscription = req.body;
  res.status(201).json({});
  // here we can send whatever we want to push notification ... even we can trigger it on event. will figure it out how to .. but data we can send
  // like if someone posted a new story, or somebody`s birthday today.
  const payload = JSON.stringify({
    title: 'WEB PUSH FROM NODE',
    body: 'this is my birthday wish me please'
  });
  console.log(subscription);
  if (2 === 2) {
    webpush.sendNotification(subscription, payload).catch(error => {
      console.error(error.stack);
    });
  }
});

module.exports = router;
