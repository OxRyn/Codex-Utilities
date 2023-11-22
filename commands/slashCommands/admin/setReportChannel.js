const { SlashCommandBuilder } = require("@discordjs/builders");
const ReportChannel = require("../../../schemas/reportChannel.js"); // Import your Mongoose schema
const { PermissionFlagsBits } = require("discord.js");
const colors = require("../../../utils/colors.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set-report-channel")
    .setDescription("🧰 Set the report channel for the guild")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Select the report channel")
        .setRequired(true)
    ),
  async execute(interaction) {
    const { channel, guild } = interaction;
    const reportChannelId = interaction.options.getChannel("channel").id;

    try {
      // Find or create a record in the database for the guild's report channel
      let reportChannel = await ReportChannel.findOneAndUpdate(
        { Guild: guild.id },
        { ChannelId: reportChannelId },
        { upsert: true, new: true }
      );

      interaction.reply({
        content: `Report channel has been set to ${interaction.options.getChannel(
          "channel"
        )}`,
      });
    } catch (error) {
      console.error(error);
      interaction.reply({
        content: "An error occurred while setting the report channel.",
        ephemeral: true,
      });
    }
  },
};
