const { model, Schema, models } = require("mongoose");

const expCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

expCategorySchema.path("name").validate(async (name) => {
  if (this.isNew) {
    const [doc] = await models.expensesCategories.find({ name });
    if (doc) return false;
  }
}, "Name already Exist");

module.exports = model("expensesCategories", expCategorySchema);
