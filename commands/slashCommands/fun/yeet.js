const {
  SlashCommandBuilder,
  Client,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const colors = require("../../../utils/colors.js");
const { YeetCount } = require("../../../schemas/fun.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("yeet")
    .setDescription("🚀 Yeet yourself into the unknown! 🚀")
    .setDMPermission(false),

  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    try {
      const memberId = interaction.user.id;
      const guildId = interaction.guild.id;

      let funRecord = await YeetCount.findOne({
        Guild: guildId,
        MemberId: memberId,
      });
      if (!funRecord) {
        funRecord = new YeetCount({
          Guild: guildId,
          MemberId: memberId,
          YeetCount: 0,
        });
      }

      funRecord.YeetCount += 1;
      await funRecord.save();
      const count = `${funRecord.YeetCount}`;

      const query = "yeet"; // You may need to change the query to something related to "yeet."

      const response = await fetch(`https://api.waifu.pics/sfw/${query}`);
      const data = await response.json();
      const fetchedImage = data.url;

      const yeetText =
        Math.random() < 0.5
          ? "You yeet yourself into the unknown and land gracefully!"
          : "Yeet! You soar through the sky and do a perfect landing!";

      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${interaction.user.username} has yeeted themselves ${count} time(s).`,
          iconURL: `${interaction.user.displayAvatarURL()}`,
        })
        .setColor(colors.Default)
        .setDescription(
          interaction.user.username === client.user.username
            ? `How can you yeet yourself?? Nvm, I'll help you 🚀 <3`
            : `🚀 **${interaction.user.username} ${yeetText}** 🚀`
        )
        .setImage(`${fetchedImage}`)
        .setFooter({
          text: `/yeet | Requested by ${interaction.user.username}`,
        })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({
        content:
          "Oops! An error occurred while executing the yeet command. Keep yeeting and soaring to new heights! 🚀\n" +
          error,
        ephemeral: true,
      });
    }
  },
};
