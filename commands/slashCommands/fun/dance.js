const {
  SlashCommandBuilder,
  Client,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const colors = require("../../../utils/colors.js");
const { DanceCount } = require("../../../schemas/fun.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dance")
    .setDescription("💃 Wanna dance? Shake a leg with this fun command! 🕺")
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

      let funRecord = await DanceCount.findOne({
        Guild: guildId,
        MemberId: memberId,
      });
      if (!funRecord) {
        funRecord = new DanceCount({
          Guild: guildId,
          MemberId: memberId,
          DanceCount: 0,
        });
      }

      funRecord.DanceCount += 1;

      await funRecord.save();

      const count = `${funRecord.DanceCount}`;

      const query = "dance";
      const response = await fetch(`https://api.waifu.pics/sfw/${query}`);
      const data = await response.json();
      const fetchedImage = data.url;

      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${interaction.user.username} has danced ${count} time(s).`,
          iconURL: `${interaction.user.displayAvatarURL()}`,
        })
        .setColor(colors.Default)
        .setDescription(
          `**💃 ${interaction.user} is dancing! Join them and let's groove! 🕺**`
        )
        .setImage(`${fetchedImage}`)
        .setFooter({
          text: `/dance | Requested by ${interaction.user.username}`,
        })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({
        content: `Oops! An error occurred while fetching the dance GIF. Seems like the dance floor got a bit slippery! 💃🕺\n${error}`,
        ephemeral: true,
      });
    }
  },
};
