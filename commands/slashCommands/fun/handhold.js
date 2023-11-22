const {
  SlashCommandBuilder,
  Client,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const colors = require("../../../utils/colors.js");
const { HandholdCount } = require("../../../schemas/fun.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("handhold")
    .setDescription(
      "🤝 Hold hands with a user. It's all about that warm and fuzzy feeling! 🤗"
    )
    .addUserOption((options) =>
      options
        .setName("user")
        .setDescription("User you want to hold hands with.")
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

      let funRecord = await HandholdCount.findOne({
        Guild: guildId,
        MemberId: memberId,
      });
      if (!funRecord) {
        funRecord = new HandholdCount({
          Guild: guildId,
          MemberId: memberId,
          HandholdCount: 0,
        });
      }

      funRecord.HandholdCount += 1;

      await funRecord.save();

      const count = `${funRecord.HandholdCount}`;

      const query = "handhold"; // You may need to change the query to something related to "handhold."
      const target = interaction.options.getUser("user");
      const response = await fetch(`https://api.waifu.pics/sfw/${query}`);
      const data = await response.json();
      const fetchedImage = data.url;

      if (interaction.user.id == target.id) {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: `${interaction.user.username} has held their own hand ${count} time(s).`,
            iconURL: `${interaction.user.displayAvatarURL()}`,
          })
          .setColor(colors.Default)
          .setDescription(
            `**🤗 ${interaction.user} held their own hand! Aww, self-love! Don't worry, we all need it sometimes! 🤝**`
          )
          .setImage(`${fetchedImage}`)
          .setFooter({
            text: `/handhold | Requested by ${interaction.user.username}`,
          })
          .setTimestamp();

        await interaction.reply({
          content: `How can you hold your own hand? Nvm, I'll help you spread the love 🤗❤️`,
          embeds: [embed],
        });
      } else {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: `${interaction.user.username} has held hands with ${target.username} ${count} time(s).`,
            iconURL: `${interaction.user.displayAvatarURL()}`,
          })
          .setColor(colors.Default)
          .setDescription(
            `**🤝 ${interaction.user} held hands with ${target}! Spread the love and warmth! 🤗**`
          )
          .setImage(`${fetchedImage}`)
          .setFooter({
            text: `/handhold | Requested by ${interaction.user.username}`,
          })
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      }
    } catch (error) {
      await interaction.reply({
        content: `Oops! An error occurred while fetching the handhold GIF. Let's not drop the handholding! 🤝❤️\n${error}`,
        ephemeral: true,
      });
    }
  },
};
