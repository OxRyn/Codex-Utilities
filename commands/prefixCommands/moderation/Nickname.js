const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const colors = require("../../../utils/colors.js");

module.exports = {
  name: "nick",
  description: "📛 Set a nickname for a user.",
  aliases: ["nickname"],
  run: async (client, message, args) => {
    if (
      !message.member.permissions.has(PermissionsBitField.Flags.ManageNicknames)
    ) {
      return message.channel.send(
        `${client.emotes.error} | You do not have the necessary permissions to use this command.`,
      );
    }

    const { guild, author } = message;
    const targetUser = message.mentions.members.first();

    if (!targetUser) {
      return message.channel.send("Please mention a member to unmute.");
    }

    const newNickname =
      args.slice(1).join(" ") || `${targetUser.user.username}`;

    // Check if the command was used in a guild (server).
    if (!message.guild) {
      return message.reply({
        content: "This command can only be used in a server (guild).",
        ephemeral: true,
      });
    }

    // Get the member object for the target user in the current guild.
    const member = message.guild.members.cache.get(targetUser.id);

    if (!member) {
      return message.reply({
        content: "The specified user is not a member of this server.",
        ephemeral: true,
      });
    }

    try {
      await member.setNickname(newNickname);

      const embed = new EmbedBuilder()
        .setColor(colors.Success)
        .setTitle("Nickname Set")
        .setDescription(
          `📛 Nickname set for ${targetUser.user.username}: \`${newNickname}\``,
        )
        .setTimestamp();

      return message.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error("Error occurred while setting the nickname:", error);

      const embed = new EmbedBuilder()
        .setAuthor({
          name: "Could not nick member due to",
          iconURL:
            "https://media.discordapp.net/attachments/1147489563648983060/1156561255138611281/amnaError1.png?ex=65156b1b&is=6514199b&hm=4723faa01a55c017f652fd75496420e113871bc20646ccafb95769ab6abaa4f1&=",
        })
        .setColor(colors.Error)
        .setDescription("An error occurred while setting the nickname.");

      return message.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
