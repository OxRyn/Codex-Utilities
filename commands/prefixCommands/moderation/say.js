const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const colors = require("../../../utils/colors.js");

module.exports = {
  name: "dm",
  description: "💬 Send a custom DM to a user.",
  aliases: ["say"],
  run: async (client, message, args) => {
    if (
      !message.member.permissions.has(PermissionsBitField.Flags.MuteMembers)
    ) {
      return message.channel.send(
        `${client.emotes.error} | You do not have the necessary permissions to use this command.`
      );
    }

    const targetUser = message.mentions.members.first();

    if (!targetUser) {
      return message.channel.send("Please mention a member to mute.");
    }

    const messageContent = args.slice(1).join(" ") || "No reason provided";

    try {
      await targetUser.user.send(messageContent);
      const successEmbed = new EmbedBuilder()
        .setColor(colors.Success)
        .setDescription(`Successfully sent a DM to ${targetUser.user.tag}.`);
      message.reply({ embeds: [successEmbed], ephemeral: true });
    } catch (error) {
      console.error("Error occurred while sending DM:", error);
      const errorEmbed = new EmbedBuilder()
        .setAuthor({
          name: "Could not DM member due to",
          iconURL:
            "https://media.discordapp.net/attachments/1147489563648983060/1156561255138611281/amnaError1.png?ex=65156b1b&is=6514199b&hm=4723faa01a55c017f652fd75496420e113871bc20646ccafb95769ab6abaa4f1&=",
        })
        .setColor(colors.Error)
        .setDescription(
          `Failed to send a DM to ${targetUser.user.tag}. Please check their DM settings or try again later.`
        );
      message.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
