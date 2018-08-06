const Joi = require("joi");

module.exports = function ProfileValidation(data, res) {
  const {
    handle,
    company,
    website,
    location,
    status,
    bio,
    birthday,
    githubusername,
    skills,
    youtube,
    facebook,
    twitter,
    linkedin,
    instagram
  } = data;

  const schema = {
    handle: Joi.string()
      .min(2)
      .max(40)
      .required(),
    company: Joi.string()
      .min(2)
      .max(40),
    location: Joi.string()
      .min(2)
      .max(40),
    status: Joi.string()
      .min(2)
      .max(40)
      .required(),
    bio: Joi.string()
      .min(2)
      .max(40),
    birthday: Joi.string(),
    githubusername: Joi.string()
      .min(2)
      .max(40),
    skills: Joi.string()
      .min(2)
      .max(40)
      .required(),
    youtube: Joi.string()
      .min(5)
      .max(100),
    facebook: Joi.string()
      .min(5)
      .max(100),
    twitter: Joi.string()
      .min(5)
      .max(100),
    linkedin: Joi.string()
      .min(5)
      .max(100),
    instagram: Joi.string()
      .min(5)
      .max(100)
  };

  const Validate = Joi.validate(data, schema);
  if (Validate.error) {
    return res.status(400).send(Validate.error.details[0].message);
  }
};

// module.exports = ProfileValidation;
