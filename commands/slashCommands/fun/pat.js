const {
  SlashCommandBuilder,
  Client,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const colors = require("../../../utils/colors.js");
const { PatCount } = require("../../../schemas/fun.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pat")
    .setDescription(
      "🐾 Give a friendly pat to a user. Share the love and fluffiness! 🐶"
    )
    .addUserOption((options) =>
      options
        .setName("user")
        .setDescription("User you want to pat.")
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

      let funRecord = await PatCount.findOne({
        Guild: guildId,
        MemberId: memberId,
      });
      if (!funRecord) {
        funRecord = new PatCount({
          Guild: guildId,
          MemberId: memberId,
          PatCount: 0,
        });
      }

      funRecord.PatCount += 1;

      await funRecord.save();

      const count = `${funRecord.PatCount}`;

      const query = "pat";
      const target = interaction.options.getUser("user");
      const response = await fetch(`https://api.waifu.pics/sfw/${query}`);
      const data = await response.json();
      const fetchedImage = data.url;

      const funnyText =
        Math.random() < 0.5
          ? "You've been patted! Enjoy the fluffiness. 🐾"
          : "Pat pat! Feel the love and fluffiness! 🐶";

      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${interaction.user.username} has patted ${target.username} ${count} time(s).`,
          iconURL: `${interaction.user.displayAvatarURL()}`,
        })
        .setColor(colors.Default)
        .setDescription(
          `**🐾 ${interaction.user} patted ${target}! ${funnyText}**`
        )
        .setImage(`${fetchedImage}`)
        .setFooter({
          text: `/pat | Requested by ${interaction.user.username}`,
        })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({
        content: `Oops! An error occurred while fetching the pat GIF. Let's keep sharing love and fluffiness! 🐾❤️\n${error}`,
        ephemeral: true,
      });
    }
  },
};
