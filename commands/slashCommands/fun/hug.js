const {
  SlashCommandBuilder,
  Client,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const colors = require("../../../utils/colors.js");
const { HugCount } = require("../../../schemas/fun.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hug")
    .setDescription("🤗 Hug a user. Because who doesn't need a warm hug? 🫂")
    .addUserOption((options) =>
      options
        .setName("user")
        .setDescription("User you want to hug.")
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

      let funRecord = await HugCount.findOne({
        Guild: guildId,
        MemberId: memberId,
      });
      if (!funRecord) {
        funRecord = new HugCount({
          Guild: guildId,
          MemberId: memberId,
          HugCount: 0,
        });
      }

      funRecord.HugCount += 1;

      await funRecord.save();

      const count = `${funRecord.HugCount}`;

      const query = "hug";
      const target = interaction.options.getUser("user");
      const response = await fetch(`https://api.waifu.pics/sfw/${query}`);
      const data = await response.json();
      const fetchedImage = data.url;

      if (interaction.user.id == target.id) {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: `${interaction.user.username} has hugged people ${count} time(s).`,
            iconURL: `${interaction.user.displayAvatarURL()}`,
          })
          .setColor(colors.Default)
          .setDescription(
            `**🫂 ${interaction.client.user} hugged ${interaction.user}! You deserve it! 🤗**`
          )
          .setImage(`${fetchedImage}`)
          .setFooter({
            text: `/hug | Requested by ${interaction.user.username}`,
          })
          .setTimestamp();

        await interaction.reply({
          content: `How can you hug yourself?? Nvm, I'll give you a warm hug 🫂🤗`,
          embeds: [embed],
        });
      } else {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: `${interaction.user.username} has hugged people ${count} time(s).`,
            iconURL: `${interaction.user.displayAvatarURL()}`,
          })
          .setColor(colors.Default)
          .setDescription(
            `**🫂 ${interaction.user} hugged ${target}! Spread the love and warmth! 🤗**`
          )
          .setImage(`${fetchedImage}`)
          .setFooter({
            text: `/hug | Requested by ${interaction.user.username}`,
          })
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      }
    } catch (error) {
      await interaction.reply({
        content: `Oops! An error occurred while fetching the anime hug GIF. Let's keep the hugs coming! 🫂🤗\n${error}`,
        ephemeral: true,
      });
    }
  },
};
