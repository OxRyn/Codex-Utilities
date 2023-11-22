const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  ChannelType,
} = require("discord.js");
const ChannelDB = require("../../../schemas/RankingChannelSchema.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("delete-ranking-system")
    .setDescription("🗑 Delete the Ranking System")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const { options, guild } = interaction;
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild))
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("⭕️ We Have a Problem.")
            .setColor("Red")
            .setDescription(
              `It seems you don't have the necessary permissions: ${PermissionFlagsBits.ManageGuild}. Contact an administrator for assistance.`
            )
            .setThumbnail(guild.iconURL({ dynamic: true })),
        ],
      });

    const channelDB2 = await ChannelDB.findOne({
      guild: guild.id,
      channel: interaction.channel.id,
    });

    if (!channelDB2) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("⭕️ We Have a Problem.")
            .setColor("Red")
            .setDescription(
              `It seems this server has not configured any channel yet. Contact an administrator to resolve this.`
            )
            .setThumbnail(guild.iconURL({ dynamic: true })),
        ],
      });
    }

    const deletedChannelDB = await ChannelDB.findOneAndDelete({
      channel: interaction.channel.id,
    });

    if (!deletedChannelDB) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("⭕️ We Have a Problem.")
            .setColor("Red")
            .setDescription(
              `I encountered an error while trying to delete the configured channel. Please try again in the next 10 minutes as our developer will be working to resolve it.`
            )
            .setThumbnail(guild.iconURL({ dynamic: true })),
        ],
      });
    }

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("💠 Configuration Successfully Deleted.")
          .setColor("Aqua")
          .setFields({
            name: "💠 Deleted by moderator:",
            value: `<@${interaction.member.id}>`,
          })
          .setThumbnail(guild.iconURL({ dynamic: true })),
      ],
      ephemeral: true,
    });
  },
};
