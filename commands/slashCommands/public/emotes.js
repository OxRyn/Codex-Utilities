const {
  SlashCommandBuilder,
  Client,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const colors = require("../../../utils/colors.js");
const Image = require("../../../utils/images.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("emotes")
    .setDescription("📑 List all static and animated emotes of the guild."),
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    // Get all the guild's emojis
    const emojis = interaction.guild.emojis.cache;

    // Filter static and animated emojis
    const staticEmojis = emojis.filter((emoji) => !emoji.animated);
    const animatedEmojis = emojis.filter((emoji) => emoji.animated);

    // Split static emojis into groups of 30 emojis per embed
    const staticEmojisChunks = chunkArray([...staticEmojis.values()], 30);

    // Create an embed for static emojis
    const staticEmotesEmbeds = staticEmojisChunks.map((emojiChunk, index) => {
      const staticEmotesEmbed = new EmbedBuilder()
        .setColor(colors.Default)
        .setDescription(emojiChunk.map((emoji) => emoji.toString()).join(" "))
        .setImage("attachment://amnaFooter4.png");

      if (index === 0) {
        staticEmotesEmbed.setTitle(`Static Emotes of the Guild`);

        if (staticEmojisChunks.length > 1) {
          staticEmotesEmbed.setFooter({
            text: `Page ${index + 1}/${
              staticEmojisChunks.length
            } | Total Static Emotes: ${staticEmojis.size}`,
          });
        } else {
          staticEmotesEmbed.setFooter({
            text: `Total Static Emotes: ${staticEmojis.size}`,
          });
        }
      } else {
        staticEmotesEmbed.setFooter({
          text: `Page ${index + 1}/${staticEmojisChunks.length}`,
        });
      }

      return staticEmotesEmbed;
    });

    // Split animated emojis into groups of 30 emojis per embed
    const animatedEmojisChunks = chunkArray([...animatedEmojis.values()], 30);

    // Create an embed for animated emojis
    const animatedEmotesEmbeds = animatedEmojisChunks.map(
      (emojiChunk, index) => {
        const animatedEmotesEmbed = new EmbedBuilder()
          .setColor(colors.Default)
          .setDescription(
            emojiChunk.map((emoji) => emoji.toString()).join(" ")
          );

        if (index === 0) {
          animatedEmotesEmbed.setTitle(`Animated Emotes of the Guild`);

          if (animatedEmojisChunks.length > 1) {
            animatedEmotesEmbed.setFooter({
              text: `Page ${index + 1}/${
                animatedEmojisChunks.length
              } | Total Animated Emotes: ${animatedEmojis.size}`,
            });
          } else {
            animatedEmotesEmbed.setFooter({
              text: `Total Animated Emotes: ${animatedEmojis.size}`,
            });
          }
        } else {
          animatedEmotesEmbed.setFooter({
            text: `Page ${index + 1}/${animatedEmojisChunks.length}`,
          });
        }

        return animatedEmotesEmbed;
      }
    );

    // Send the initial response
    await interaction.reply({
      embeds: [...staticEmotesEmbeds, ...animatedEmotesEmbeds],
      files: [Image.amnaFooter4],
    });
  },
};

/**
 * Split an array into smaller arrays of a specified size.
 * @param {Array} array - The array to split.
 * @param {number} size - The size of each chunk.
 * @returns {Array} An array of smaller arrays.
 */
function chunkArray(array, size) {
  const chunkedArray = [];
  for (let i = 0; i < array.length; i += size) {
    chunkedArray.push(array.slice(i, i + size));
  }
  return chunkedArray;
}
