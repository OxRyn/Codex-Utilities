const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  Client,
  ChatInputCommandInteraction,
} = require("discord.js");
const Bots = require("../../../schemas/bots.js"); // Make sure to use the correct path

module.exports = {
  data: new SlashCommandBuilder()
    .setName("discontinue")
    .setDescription("Discontinue a bot")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)
    .addStringOption((option) =>
      option
        .setName("botid")
        .setDescription("The ID of the bot to discontinue")
        .setRequired(true)
    ),

  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    try {
      const botID = interaction.options.getString("botid");

      // Check if the bot with the provided ID exists
      let existingBot = await Bots.findOne({ BotID: botID });

      // If the bot doesn't exist, create a new document
      if (!existingBot) {
        existingBot = new Bots({ BotID: botID });
      }

      // Update the database to mark the bot as discontinued
      existingBot.discontinued = true;
      await existingBot.save();

      interaction.reply({
        content: `Bot with ID ${botID} has been discontinued.`,
      });
    } catch (error) {
      console.error(error);
      interaction.reply({
        content: "An error occurred while processing your request.",
        ephemeral: true,
      });
    }
  },
};
