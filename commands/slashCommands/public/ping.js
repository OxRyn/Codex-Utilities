const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  Client,
  ChatInputCommandInteraction,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check the bot's latency and API response time")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const startTime = Date.now();
    const msg = await interaction.reply({
      content: "Pinging...",
      ephemeral: true,
    });
    const endTime = Date.now();
    const latency = endTime - startTime;

    msg.edit({
      content: `**Pong!** 🛰️\n**Latency:** \`${latency}\`ms\n**API Latency:** \`${client.ws.ping}\`ms`,
      ephemeral: true,
    });
  },
};
