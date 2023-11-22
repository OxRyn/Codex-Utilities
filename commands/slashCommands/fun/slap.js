const {
  SlashCommandBuilder,
  Client,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const colors = require("../../../utils/colors.js");
const { SlapCount } = require("../../../schemas/fun.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("slap")
    .setDescription(
      "🖐️ Playfully slap a user and watch out for the reaction! 😄"
    )
    .addUserOption((options) =>
      options
        .setName("user")
        .setDescription("User you want to slap.")
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

      let funRecord = await SlapCount.findOne({
        Guild: guildId,
        MemberId: memberId,
      });
      if (!funRecord) {
        funRecord = new SlapCount({
          Guild: guildId,
          MemberId: memberId,
          SlapCount: 0,
        });
      }

      funRecord.SlapCount += 1;

      await funRecord.save();

      const count = `${funRecord.SlapCount}`;

      const query = "slap";
      const target = interaction.options.getUser("user");
      const response = await fetch(`https://api.waifu.pics/sfw/${query}`);
      const data = await response.json();
      const fetchedImage = data.url;

      if (interaction.user.id == target.id) {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: `${interaction.user.username} has slapped people ${count} time(s).`,
            iconURL: `${interaction.user.displayAvatarURL()}`,
          })
          .setColor(colors.Default)
          .setDescription(
            `**🖐️ ${interaction.client.user} slapped ${interaction.user}!**`
          )
          .setImage(`${fetchedImage}`)
          .setFooter({
            text: `/slap | Requested by ${interaction.user.username}`,
          })
          .setTimestamp();

        await interaction.reply({
          content: `How can you slap yourself? 🤔 Nvm, I'll help you spread the love! ❤️`,
          embeds: [embed],
        });
      } else {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: `${interaction.user.username} has slapped people ${count} time(s).`,
            iconURL: `${interaction.user.displayAvatarURL()}`,
          })
          .setColor(colors.Default)
          .setDescription(`**🖐️ ${interaction.user} slapped ${target}! 😄**`)
          .setImage(`${fetchedImage}`)
          .setFooter({
            text: `/slap | Requested by ${interaction.user.username}`,
          })
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      }
    } catch (error) {
      await interaction.reply({
        content: `Oops! An error occurred while fetching the slap GIF. Keep slapping and having fun! 🖐️😄\n${error}`,
        ephemeral: true,
      });
    }
  },
};
