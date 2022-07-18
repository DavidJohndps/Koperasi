const { model, Schema, models } = require("mongoose");

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    npwp: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

userSchema.path("email").validate(async (value) => {
  if (this.isNew) {
    const [doc] = await models.Users.find({ email: value });
    if (doc) return false;
  }
  return true
}, "Email already exist");

module.exports = model("Users", userSchema);
