const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  Client,
  ChatInputCommandInteraction,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("webhook")
    .setDescription("Create a webhook")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  execute(interaction, client) {
    const channel = interaction.channel;
    channel
      .createWebhook({
        name: interaction.client.user.username,
        avatar: interaction.client.user.displayAvatarURL(),
      })
      .then((webhook) => channel.send(`Created webhook ${webhook.url}`))
      .catch(console.error);
  },
};
