const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const Joi = require('joi');
const ProfileValidation = require('./ProfileValidation-Joi');
const ExperienceValidation = require('./experienceValidation-joi');
const EducationValidation = require('./EducationValidation-joi');
// twilio credentials
const twilioAccountSid = require('../../config/Keys').twilioAccountSid;
const twilioAuthToken = require('../../config/Keys').twilioAuthToken;

// Load Profile Model
const Profile = require('../../model/Profile');
const User = require('../../model/User');
//SMS To User Phone
router.post('/sms', (req, res) => {
  const client = require('twilio')(twilioAccountSid, twilioAuthToken);
  const opts = {};
  opts.body = 'This is my test sms from twilio';
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

// Get Current User Profile
// @Private Route
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({
      user: req.user.id
    })
      // populate user info from user model and add it into response in profile fetch.
      .populate('user', ['name', 'email'])
      .then(profile => {
        if (!profile) {
          res.status(404).json({ Error: 'Profile Not Found!' });
        }
        res.json(profile);
      })
      .catch(err => {
        res.status(404).json(err);
      });
  }
);
// POST api/Profile
// @desc Create or Update user profile
// @Private Route
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    // Joi Validation Seperate File ProfileValidation-Joi Export ProfileValidation and provide args req.body, res
    ProfileValidation(req.body, res);

    // Get Fields for Profile
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.bio) profileFields.bio = req.body.bio;
    // Add birthday to send automatic sms and Emails check notification folder for more details.
    if (req.body.birthday) {
      const unixTime = parseInt(
        (new Date(req.body.birthday).getTime() / 1000).toFixed(0)
      );
      profileFields.birthday = unixTime;
    }
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;
    // Skills - Split into array
    if (typeof req.body.skills !== 'undefined') {
      profileFields.skills = req.body.skills.split(',');
    }
    // Social
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.insagram) profileFields.social.insagram = req.body.insagram;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;

    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          //new: true means res.json will return new updated profile, we dont provide new it will res.json(old profile)
          //its just to see new updated profile on the fly in return and frontEnd
          { new: true }
        ).then(profile => res.json(profile));
      } else {
        // Create
        // Check if the handle exists  for SEO
        Profile.findOne({ handle: profileFields.handle }).then(profile => {
          if (profile) {
            res.status(400).json('Handle Exists');
          }
          // Save Profile
          new Profile(profileFields).save().then(profile => {
            res.json(profile);
          });
        });
      }
    });
  }
);

// Add Experience to profile
router.post(
  '/experience',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    ExperienceValidation(req.body, res);
    Profile.findOne({ user: req.user.id }).then(profile => {
      if (!profile) {
        return res.json({ Error: 'No Profile Associated' });
      }
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.currnet,
        description: req.body.description
      };
      // to brin this experience at the top, we use unshift, if wanted it to be at end push would do the job.
      profile.experience.unshift(newExp);
      profile.save().then(profile => res.json(profile));
    });
  }
);

// Delete Experience from Profile by exp_id
router.delete(
  '/experience/:exp_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne(
      { user: req.user.id }
      // { new: true }
    )
      .then(profile => {
        // Get Remove Index
        const removeIndex = profile.experience
          .map(item => item.id)
          .indexOf(req.params.exp_id);

        //Splice out of array ... we will take this item out of our array of experience
        profile.experience.splice(removeIndex, 1);
        //Save Profile and res.json
        profile.save().then(profile => {
          res.json(profile);
        });
      })
      .catch(err => {
        res.status(404).json(err);
      });
  }
);

// Add Education to profile
router.post(
  '/education',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    EducationValidation(req.body, res);
    Profile.findOne({ user: req.user.id }).then(profile => {
      if (!profile) {
        return res.json({ Error: 'No Profile Associated' });
      }
      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.currnet,
        description: req.body.description
      };
      // to brin this experience at the top, we use unshift, if wanted it to be at end push would do the job.
      profile.education.unshift(newEdu);
      profile.save().then(profile => res.json(profile));
    });
  }
);

// Delete Education
router.delete(
  '/education/:edu_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      if (!profile) {
        return res.json({ Error: 'No Profile Associated with user' });
      }
      const removeIndex = profile.education
        .map(item => item.id)
        .indexOf(req.params.edu_id);
      profile.education.splice(removeIndex, 1);
      profile
        .save()
        .then(profile => {
          res.json(profile);
        })
        .catch(err => {
          res.json(err);
        });
    });
  }
);

// Delete Profile and User
router.delete(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    // if we only want to delete the profile we can stop after below linke and after .then(() => res.json(bla bla bla ))
    Profile.findOneAndRemove({ user: req.user.id }).then(() => {
      User.findOneAndRemove({ _id: req.user.id }).then(() =>
        res.json({ ProfileRemoved: 'Sad to See you Going' })
      );
    });
  }
);

module.exports = router;
