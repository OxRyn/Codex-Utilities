const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  Client,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const afkSchema = require("../../../schemas/afk.js");
const colors = require("../../../utils/colors.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("afk")
    .setDescription("SetAFK")
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason for going afk.")
        .setRequired(false)
    )
    .setDMPermission(false),

  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const { options } = interaction;
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;

    const data = await afkSchema.findOne({
      Guild: guildId,
      User: userId,
    });

    if (data) {
      return await interaction.reply({
        content: `You are already AFK within this server`,
        ephemeral: true,
      });
    } else {
      const reason = options.getString("reason");

      await afkSchema.create({
        Guild: guildId,
        User: userId,
        Message: reason,
      });

      const embed = new EmbedBuilder()
        .setColor(colors.Information)
        .setDescription(
          `You are now afk within this server!\nSend a message to remove your afk.`
        );

      await interaction.reply({ embeds: [embed] });
    }
  },
};
