const {
  SlashCommandBuilder,
  Client,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const colors = require("../../../utils/colors.js");
const { HighFiveCount } = require("../../../schemas/fun.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("highfive")
    .setDescription(
      "🖐️ Give a high five to a user. Spread the high fives and good vibes! 🎉"
    )
    .addUserOption((options) =>
      options
        .setName("user")
        .setDescription("User you want to give a high five to.")
        .setRequired(true)
    )
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

      let funRecord = await HighFiveCount.findOne({
        Guild: guildId,
        MemberId: memberId,
      });
      if (!funRecord) {
        funRecord = new HighFiveCount({
          Guild: guildId,
          MemberId: memberId,
          HighFiveCount: 0,
        });
      }

      funRecord.HighFiveCount += 1;

      await funRecord.save();

      const count = `${funRecord.HighFiveCount}`;

      const query = "highfive";
      const target = interaction.options.getUser("user");
      const response = await fetch(`https://api.waifu.pics/sfw/${query}`);
      const data = await response.json();
      const fetchedImage = data.url;

      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${interaction.user.username} has given high fives ${count} time(s).`,
          iconURL: `${interaction.user.displayAvatarURL()}`,
        })
        .setColor(colors.Default)
        .setDescription(
          `**🖐️ ${interaction.user} gave a high five to ${target}! Keep spreading the high fives and good vibes! 🎉**`
        )
        .setImage(`${fetchedImage}`)
        .setFooter({
          text: `/highfive | Requested by ${interaction.user.username}`,
        })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({
        content: `Oops! An error occurred while fetching the high five GIF. Let's keep the high fives and good vibes going! 🖐️🎉\n${error}`,
        ephemeral: true,
      });
    }
  },
};
