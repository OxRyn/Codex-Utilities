const fs = require("fs");
const {
  SlashCommandBuilder,
  Client,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("showreadme")
    .setDescription("Show contents of README.md in an embed")
    .addAttachmentOption((option) =>
      option
        .setName("readme")
        .setDescription("The README.md file")
        .setRequired(true),
    )
    .setDMPermission(false),

  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    if (interaction.user.id !== "978191892569288724") {
      interaction.reply({
        content: "This command is only available to devs.",
        ephemeral: true,
      });
      return;
    }

    // Specify the path to your README.md file
    const readmePath = interaction.options.getAttachment("reademe");
    const yuh = readmePath;

    // Read the contents of the README.md file
    fs.readFile(yuh, "utf8", (err, data) => {
      if (err) {
        console.error(err);
        interaction.reply(
          "An error occurred while reading the README.md file.",
        );
        return;
      }

      // Create an embed with the README contents
      const embed = new EmbedBuilder()
        .setTitle("README.md Contents")
        .setDescription(data);

      // Send the embed
      interaction.reply({ embeds: [embed] });
    });
  },
};
