const Joi = require("joi");

module.exports = function postValidation(data, res) {
  const { title, text, image } = data;
  const schema = {
    title: Joi.string()
      .min(3)
      .max(30)
      .required(),
    text: Joi.string()
      .min(3)
      .required()
  };
  const Validate = Joi.validate(data, schema);
  if (Validate.error) {
    res.status(400).send(Validate.error.details[0].message);
  }
};
