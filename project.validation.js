const Joi = require("joi");

const projectSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(""),
  status: Joi.string().valid("PLANNED","ACTIVE","ON_HOLD","COMPLETED","CANCELLED"),
  priority: Joi.string().valid("LOW","MEDIUM","HIGH","CRITICAL"),
  start_date: Joi.date(),
  end_date: Joi.date(),
  owner_id: Joi.number().required(),
  manager_id: Joi.number().allow(null)
});

module.exports = projectSchema;
