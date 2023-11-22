const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  Client,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const colors = require("../../../utils/colors.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("👤 View a user's avatar.")
    .addUserOption((options) =>
      options
        .setName("user")
        .setDescription("Select the user to view their avatar.")
        .setRequired(true)
    )
    .setDMPermission(false),

  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  execute(interaction, client) {
    const target = interaction.options.getUser("user");
    const embed = new EmbedBuilder()
      .setColor(colors.Information)
      .setAuthor({
        name: `${target.username} | ${target.id}`,
        iconURL: `${target.displayAvatarURL({ dynamic: true, size: 256 })}`,
      })
      .setImage(`${target.displayAvatarURL({ dynamic: true, size: 1024 })}`)
      .setFooter({
        text: `👤 /avatar | Requested by ${interaction.user.username}`,
      })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  },
};
