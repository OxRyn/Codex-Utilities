const { Schema, model } = require("mongoose");

const modRoleSchema = new Schema({
  guildId: {
    type: String,
    required: true,
  },
  modRooleIds: {
    type: [String],
    default: [],
  },
});

module.exports = model("ModRole", modRoleSchema);
