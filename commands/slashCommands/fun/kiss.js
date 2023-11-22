const {
  SlashCommandBuilder,
  Client,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const colors = require("../../../utils/colors.js");
const { KissCount } = require("../../../schemas/fun.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kiss")
    .setDescription("😘 Kiss a user. Because spreading love is awesome! 💋")
    .addUserOption((options) =>
      options
        .setName("user")
        .setDescription("User you want to kiss.")
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

      let funRecord = await KissCount.findOne({
        Guild: guildId,
        MemberId: memberId,
      });
      if (!funRecord) {
        funRecord = new KissCount({
          Guild: guildId,
          MemberId: memberId,
          KissCount: 0,
        });
      }

      funRecord.KissCount += 1;

      await funRecord.save();

      const count = `${funRecord.KissCount}`;

      const query = "kiss";
      const target = interaction.options.getUser("user");
      const response = await fetch(`https://api.waifu.pics/sfw/${query}`);
      const data = await response.json();
      const fetchedImage = data.url;

      if (interaction.user.id == target.id) {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: `${interaction.user.username} has kissed people ${count} time(s).`,
            iconURL: `${interaction.user.displayAvatarURL()}`,
          })
          .setColor(colors.Default)
          .setDescription(
            `**😘 ${interaction.client.user} kissed ${interaction.user}! You deserve it! 💋**`
          )
          .setImage(`${fetchedImage}`)
          .setFooter({
            text: `/kiss | Requested by ${interaction.user.username}`,
          })
          .setTimestamp();

        await interaction.reply({
          content: `How can you kiss yourself?? Nvm, I'll give you a sweet kiss! 😘💋`,
          embeds: [embed],
        });
      } else {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: `${interaction.user.username} has kissed people ${count} time(s).`,
            iconURL: `${interaction.user.displayAvatarURL()}`,
          })
          .setColor(colors.Default)
          .setDescription(
            `**😘 ${interaction.user} kissed ${target}! Spread the love and sweetness! 💋**`
          )
          .setImage(`${fetchedImage}`)
          .setFooter({
            text: `/kiss | Requested by ${interaction.user.username}`,
          })
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      }
    } catch (error) {
      await interaction.reply({
        content: `Oops! An error occurred while fetching the anime kiss GIF. Let's keep the kisses coming! 😘💋\n${error}`,
        ephemeral: true,
      });
    }
  },
};
