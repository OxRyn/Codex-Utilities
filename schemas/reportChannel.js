const { model, Schema } = require("mongoose");

module.exports = model(
  "ReportChannel",
  new Schema({
    Guild: String,
    ChannelId: String,
  }),
);
