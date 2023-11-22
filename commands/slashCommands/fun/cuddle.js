const {
  SlashCommandBuilder,
  Client,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const colors = require("../../../utils/colors.js");
const { CuddleCount } = require("../../../schemas/fun.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cuddle")
    .setDescription("🤗 Cuddle a user and spread the love!")
    .addUserOption((options) =>
      options
        .setName("user")
        .setDescription("User you want to cuddle.")
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

      let funRecord = await CuddleCount.findOne({
        Guild: guildId,
        MemberId: memberId,
      });
      if (!funRecord) {
        funRecord = new CuddleCount({
          Guild: guildId,
          MemberId: memberId,
          CuddleCount: 0,
        });
      }

      funRecord.CuddleCount += 1;

      await funRecord.save();

      const count = `${funRecord.CuddleCount}`;

      const query = "cuddle"; // You may need to change the query to something related to "cuddle."
      const target = interaction.options.getUser("user");
      const response = await fetch(`https://api.waifu.pics/sfw/${query}`);
      const data = await response.json();
      const fetchedImage = data.url;

      // If the user attempts to cuddle themselves
      if (interaction.user.id == target.id) {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: `${interaction.user.username} has cuddled themselves ${count} time(s).`,
            iconURL: `${interaction.user.displayAvatarURL()}`,
          })
          .setColor(colors.Default)
          .setDescription(
            `**🤗 ${interaction.user} cuddled themselves! Aww, self-love!**`
          )
          .setImage(`${fetchedImage}`)
          .setFooter({
            text: `/cuddle | Requested by ${interaction.user.username}`,
          })
          .setTimestamp();

        await interaction.reply({
          content: `How can you cuddle yourself? Nvm, I'll help you spread the love <3`,
          embeds: [embed],
        });
      } else {
        // User cuddles someone else
        const embed = new EmbedBuilder()
          .setAuthor({
            name: `${interaction.user.username} has cuddled people ${count} time(s).`,
            iconURL: `${interaction.user.displayAvatarURL()}`,
          })
          .setColor(colors.Default)
          .setDescription(
            `**🤗 ${interaction.user} cuddled ${target}! Let's spread the love!**`
          )
          .setImage(`${fetchedImage}`)
          .setFooter({
            text: `/cuddle | Requested by ${interaction.user.username}`,
          })
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      }
    } catch (error) {
      await interaction.reply({
        content: `Oops! An error occurred while fetching the cuddle GIF. The love got too wild! 🙃\n${error}`,
        ephemeral: true,
      });
    }
  },
};
