const {
  SlashCommandBuilder,
  Client,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const colors = require("../../../utils/colors.js");
const { BiteCount } = require("../../../schemas/fun.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bite")
    .setDescription("😈🦷 Bite a user and show your ferocious love!")
    .addUserOption((options) =>
      options
        .setName("user")
        .setDescription("User you want to bite.")
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

      let funRecord = await BiteCount.findOne({
        Guild: guildId,
        MemberId: memberId,
      });
      if (!funRecord) {
        funRecord = new BiteCount({
          Guild: guildId,
          MemberId: memberId,
          BiteCount: 0,
        });
      }

      funRecord.BiteCount += 1;

      await funRecord.save();

      const count = `${funRecord.BiteCount}`;

      const query = "bite"; // You may need to change the query to something related to "bite."
      const target = interaction.options.getUser("user");
      const response = await fetch(`https://api.waifu.pics/sfw/${query}`);
      const data = await response.json();
      const fetchedImage = data.url;

      if (interaction.user.id == target.id) {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: `${interaction.user.username} has bitten people ${count} time(s).`,
            iconURL: `${interaction.user.displayAvatarURL()}`,
          })
          .setColor(colors.Default)
          .setDescription(
            `**😅 ${interaction.client.user} bit ${interaction.user}! Ouch! That's some self-love!**`
          )
          .setImage(`${fetchedImage}`)
          .setFooter({
            text: `/bite | Requested by ${interaction.user.username}`,
          })
          .setTimestamp();

        await interaction.reply({
          content: `How can you bite yourself?? Nvm, I'll help you <3`,
          embeds: [embed],
        });
      } else {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: `${interaction.user.user} has bitten people ${count} time(s).`,
            iconURL: `${interaction.user.displayAvatarURL()}`,
          })
          .setColor(colors.Default)
          .setDescription(
            `**😄 ${interaction.user} bit ${target}! Nibble nibble!**`
          )
          .setImage(`${fetchedImage}`)
          .setFooter({
            text: `/bite | Requested by ${interaction.user.username}`,
          })
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      }
    } catch (error) {
      await interaction.reply({
        content: `Oops! An error occurred while fetching the bite GIF. Maybe the server needs a snack too! 🍔\n${error}`,
        ephemeral: true,
      });
    }
  },
};
