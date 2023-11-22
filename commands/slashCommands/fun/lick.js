const {
  SlashCommandBuilder,
  Client,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const colors = require("../../../utils/colors.js");
const { LickCount } = require("../../../schemas/fun.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lick")
    .setDescription("😜 Lick a user.")
    .addUserOption((options) =>
      options
        .setName("user")
        .setDescription("😜 User you want to lick.")
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

      let funRecord = await LickCount.findOne({
        Guild: guildId,
        MemberId: memberId,
      });
      if (!funRecord) {
        funRecord = new LickCount({
          Guild: guildId,
          MemberId: memberId,
          LickCount: 0,
        });
      }

      funRecord.LickCount += 1;

      await funRecord.save();

      const count = `${funRecord.LickCount}`;

      const query = "lick"; // You may need to change the query to something related to "lick."
      const target = interaction.options.getUser("user");
      const response = await fetch(`https://api.waifu.pics/sfw/${query}`);
      const data = await response.json();
      const fetchedImage = data.url;

      if (interaction.user.id == target.id) {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: `${interaction.user.username} has licked themselves ${count} time(s).`,
            iconURL: `${interaction.user.displayAvatarURL()}`,
          })
          .setColor(colors.Default)
          .setDescription(
            `**${interaction.user} licked themselves! Self-love is essential!**`
          )
          .setImage(`${fetchedImage}`)
          .setFooter({
            text: `/lick | Requested by ${interaction.user.username}`,
          })
          .setTimestamp();

        await interaction.reply({
          content: `How can you lick yourself? Nvm, I'll help you spread the love <3`,
          embeds: [embed],
        });
      } else {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: `${interaction.user.username} has licked ${target.username} ${count} time(s).`,
            iconURL: `${interaction.user.displayAvatarURL()}`,
          })
          .setColor(colors.Default)
          .setDescription(`**${interaction.user} licked ${target}!**`)
          .setImage(`${fetchedImage}`)
          .setFooter({
            text: `/lick | Requested by ${interaction.user.username}`,
          })
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      }
    } catch (error) {
      await interaction.reply({
        content: `An error occurred while fetching the lick GIF.\n${error}`,
        ephemeral: true,
      });
    }
  },
};
