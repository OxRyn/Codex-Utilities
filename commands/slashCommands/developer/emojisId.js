const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  Client,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const Image = require("../../../utils/images");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("emojilist")
    .setDescription("List all emojis of the guild")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  execute(interaction, client) {
    // Get the guild emojis
    const guildEmojis = interaction.guild.emojis.cache;

    // Create an array to store emoji strings
    const emojiList = [];

    // Loop through the emojis and add them to the array
    guildEmojis.forEach((emoji) => {
      emojiList.push(`${emoji} - \`<:${emoji.name}:${emoji.id}>\``);
    });

    // Split the emojis into chunks of 15
    const chunks = [];
    for (let i = 0; i < emojiList.length; i += 15) {
      chunks.push(emojiList.slice(i, i + 15));
    }

    // Create and send embeds with fields
    chunks.forEach((chunk, index) => {
      const embed = new EmbedBuilder()
        .setTitle(`Emoji List - Page ${index + 1}`)
        .setDescription(chunk.join("\n"))
        .setImage("attachment://amnaFooter1.png");

      interaction.channel.send({ embeds: [embed], files: [Image.amnaFooter1] });
    });
  },
};
