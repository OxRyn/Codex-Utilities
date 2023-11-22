const {
  SlashCommandBuilder,
  Client,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const colors = require("../../../utils/colors.js");
const { WinkCount } = require("../../../schemas/fun.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("wink")
    .setDescription("😉 Give a sly wink to someone and spread the charm! 😉")
    .addUserOption((options) =>
      options
        .setName("user")
        .setDescription("User you want to wink at.")
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

      let funRecord = await WinkCount.findOne({
        Guild: guildId,
        MemberId: memberId,
      });
      if (!funRecord) {
        funRecord = new WinkCount({
          Guild: guildId,
          MemberId: memberId,
          WinkCount: 0,
        });
      }

      funRecord.WinkCount += 1;

      await funRecord.save();

      const count = `${funRecord.WinkCount}`;

      const query = "wink";
      const target = interaction.options.getUser("user");
      const response = await fetch(`https://api.waifu.pics/sfw/${query}`);
      const data = await response.json();
      const fetchedImage = data.url;

      if (interaction.user.id == target.id) {
        await interaction.reply({
          content:
            "Winking at yourself? Maybe it's time to invest in a mirror! 😉",
        });
      } else {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: `${interaction.user.username} has winked at ${target.username} ${count} time(s).`,
            iconURL: `${interaction.user.displayAvatarURL()}`,
          })
          .setColor(colors.Default)
          .setDescription(
            `**😉 ${interaction.user} gave a sly wink to ${target}! Charm level over 9000! 😉**`
          )
          .setImage(`${fetchedImage}`)
          .setFooter({
            text: `/wink | Requested by ${interaction.user.username}`,
          })
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      }
    } catch (error) {
      await interaction.reply({
        content:
          "Oops! An error occurred while fetching the wink GIF. Keep winking and stay charming! 😉\n" +
          error,
        ephemeral: true,
      });
    }
  },
};
