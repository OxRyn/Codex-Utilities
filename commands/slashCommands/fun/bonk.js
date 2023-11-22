const {
  SlashCommandBuilder,
  Client,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const colors = require("../../../utils/colors.js");
const { BonkCount } = require("../../../schemas/fun.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bonk")
    .setDescription("🔨🤣 Bonk a user and show your playful authority!")
    .addUserOption((options) =>
      options
        .setName("user")
        .setDescription("User you want to bonk.")
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

      let funRecord = await BonkCount.findOne({
        Guild: guildId,
        MemberId: memberId,
      });
      if (!funRecord) {
        funRecord = new BonkCount({
          Guild: guildId,
          MemberId: memberId,
          BonkCount: 0,
        });
      }

      funRecord.BonkCount += 1;

      await funRecord.save();

      const count = `${funRecord.BonkCount}`;

      const query = "bonk"; // You may need to change the query to something related to "bonk."
      const target = interaction.options.getUser("user");
      const response = await fetch(`https://api.waifu.pics/sfw/${query}`);
      const data = await response.json();
      const fetchedImage = data.url;

      if (interaction.user.id == target.id) {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: `${interaction.user.username} has bonked people ${count} time(s).`,
            iconURL: `${interaction.user.displayAvatarURL()}`,
          })
          .setColor(colors.Default)
          .setDescription(
            `**🤣 ${interaction.client.user} bonked ${interaction.user}! Ouch! That's some self-bonking!**`
          )
          .setImage(`${fetchedImage}`)
          .setFooter({
            text: `/bonk | Requested by ${interaction.user.username}`,
          })
          .setTimestamp();

        await interaction.reply({
          content: `How can you bonk yourself?? Nvm, I'll help you <3`,
          embeds: [embed],
        });
      } else {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: `${interaction.user.username} has bonked people ${count} time(s).`,
            iconURL: `${interaction.user.displayAvatarURL()}`,
          })
          .setColor(colors.Default)
          .setDescription(
            `**😄 ${interaction.user} bonked ${target}! Hammer time!**`
          )
          .setImage(`${fetchedImage}`)
          .setFooter({
            text: `/bonk | Requested by ${interaction.user.username}`,
          })
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      }
    } catch (error) {
      await interaction.reply({
        content: `Oops! An error occurred while fetching the bonk GIF. The bonking hammer got tired! 🙃\n${error}`,
        ephemeral: true,
      });
    }
  },
};
