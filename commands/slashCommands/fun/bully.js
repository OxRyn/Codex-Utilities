const {
  SlashCommandBuilder,
  Client,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const colors = require("../../../utils/colors.js");
const { BullyCount } = require("../../../schemas/fun.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bully")
    .setDescription("👿 Bully a user and unleash your inner mischief!")
    .addUserOption((options) =>
      options
        .setName("user")
        .setDescription("User you want to bully.")
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

      let funRecord = await BullyCount.findOne({
        Guild: guildId,
        MemberId: memberId,
      });
      if (!funRecord) {
        funRecord = new BullyCount({
          Guild: guildId,
          MemberId: memberId,
          BullyCount: 0,
        });
      }

      funRecord.BullyCount += 1;

      await funRecord.save();

      const count = `${funRecord.BullyCount}`;

      const query = "bully"; // You may need to change the query to something related to "bully".
      const target = interaction.options.getUser("user");
      const response = await fetch(`https://api.waifu.pics/sfw/${query}`);
      const data = await response.json();
      const fetchedImage = data.url;

      if (interaction.user.id == target.id) {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: `${interaction.user.username} has bullied people ${count} time(s).`,
            iconURL: `${interaction.user.displayAvatarURL()}`,
          })
          .setColor(colors.Default)
          .setDescription(
            `**👿 ${interaction.client.user} bullied ${interaction.user}! You're quite the self-bully!**`
          )
          .setImage(`${fetchedImage}`)
          .setFooter({
            text: `/bully | Requested by ${interaction.user.username}`,
          })
          .setTimestamp();

        await interaction.reply({
          content: `How can you bully yourself?? Nvm, I'll help you <3`,
          embeds: [embed],
        });
      } else {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: `${interaction.user.username} has bullied people ${count} time(s).`,
            iconURL: `${interaction.user.displayAvatarURL()}`,
          })
          .setColor(colors.Default)
          .setDescription(
            `**😈 ${interaction.user} bullied ${target}! Unleash the mischief!**`
          )
          .setImage(`${fetchedImage}`)
          .setFooter({
            text: `/bully | Requested by ${interaction.user.username}`,
          })
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      }
    } catch (error) {
      await interaction.reply({
        content: `Oops! An error occurred while fetching the bullying GIF. The mischief got too wild! 🙃\n${error}`,
        ephemeral: true,
      });
    }
  },
};
