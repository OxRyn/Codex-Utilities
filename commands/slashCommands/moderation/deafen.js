const {
  SlashCommandBuilder,
  Client,
  ChatInputCommandInteraction,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("deafen")
    .setDescription("🔇 Deafen a user in the voice channel.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("👤 The user to deafen")
        .setRequired(true),
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    // Get the user from the interaction options
    const user = interaction.options.getUser("user");

    // Check if the user exists
    if (!user) {
      return interaction.reply("❌ User not found.");
    }

    // Get the member from the user in the guild
    const member = interaction.guild.members.cache.get(user.id);

    // Check if the member is in a voice channel
    if (!member.voice.channel) {
      return interaction.reply("❌ The user is not in a voice channel.");
    }

    // Deafen the user in the voice channel
    try {
      await member.voice.setDeaf(true);
      interaction.reply(`✅ ${user.tag} has been deafened.`);
    } catch (error) {
      console.error(error);
      interaction.reply("❌ Unable to deafen the user.");
    }
  },
};
