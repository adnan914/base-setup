import Joi from "joi";

const userSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role : Joi.string().valid("ADMIN","USER","MODERATOR")
});

const attendanceSchema = Joi.object({
  userId: Joi.number().integer().required(),
  date: Joi.date().iso().required(),
  status: Joi.string().valid("present", "absent").required(),
});

export { userSchema, attendanceSchema };
