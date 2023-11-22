const { PermissionsBitField } = require("discord.js");

module.exports = {
  name: "deafen",
  description: "🔇 Deafen a user in the voice channel.",
  aliases: ["def"],
  run: async (client, message, args) => {
    if (
      !message.member.permissions.has(PermissionsBitField.Flags.MuteMembers)
    ) {
      return message.channel.send(
        `${client.emotes.error} | You do not have the necessary permissions to use this command.`,
      );
    }

    const target = message.mentions.members.first();
    const member = message.guild.members.cache.get(target.id);

    // Check if the member is in a voice channel
    if (!member.voice.channel) {
      return message.reply("❌ The user is not in a voice channel.");
    }

    // Deafen the user in the voice channel
    try {
      await member.voice.setDeaf(true);
      message.reply(`✅ ${target.username} has been deafened.`);
    } catch (error) {
      console.error(error);
      message.reply("❌ Unable to deafen the user.");
    }
  },
};
