const { model, Schema } = require("mongoose");

module.exports = model(
  "MuteRole",
  new Schema({
    Guild: String,
    RoleId: String,
  }),
);
