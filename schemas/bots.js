const { model, Schema } = require("mongoose");

let BotsSchema = new Schema({
  BotID: String,
  discontinued: {
    type: Boolean,
    default: false,
  },
});

module.exports = model("Bots", BotsSchema);
