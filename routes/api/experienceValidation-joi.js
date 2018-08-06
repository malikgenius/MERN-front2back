const Joi = require("joi");

module.exports = function experienceValidation(data, res) {
  const { title, company, location, from, to, current, description } = data;
  const schema = {
    title: Joi.string()
      .min(3)
      .max(100)
      .required(),
    company: Joi.string()
      .min(3)
      .max(100)
      .required(),
    location: Joi.string()
      .min(3)
      .max(100)
      .required(),
    from: Joi.string()
      .min(3)
      .max(100)
      .required(),
    to: Joi.string()
      .min(3)
      .max(100),
    current: Joi.boolean(),
    description: Joi.string()
      .min(3)
      .max(200)
  };

  const Validate = Joi.validate(data, schema);
  if (Validate.error) {
    return res.status(400).send(Validate.error.details[0].message);
  }
};
