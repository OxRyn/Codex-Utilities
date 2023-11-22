const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const colors = require("../../../utils/colors.js");
module.exports = {
  name: "perms",
  description: "🔒 Show a user's permissions.",
  aliases: ["Perms", "permissions"],
  run: async (client, message, interaction) => {
    if (
      !message.member.permissions.has(PermissionsBitField.Flags.ManageNicknames)
    ) {
      return message.channel.send(
        `${client.emotes.error} | You do not have the necessary permissions to use this command.`,
      );
    }

    const target = message.mentions.members.first();

    if (!target) {
      return message.channel.send(
        "Please mention a member whose nickname you want to change.",
      );
    }

    const errorsEmbed = new EmbedBuilder()
      .setAuthor({
        name: "Could not fetch permissions due to",
        iconURL:
          "https://media.discordapp.net/attachments/1147489563648983060/1156561255138611281/amnaError1.png?ex=65156b1b&is=6514199b&hm=4723faa01a55c017f652fd75496420e113871bc20646ccafb95769ab6abaa4f1&=",
      })
      .setColor(colors.Error);

    try {
      // Check if the target member is valid
      if (!target) {
        throw new Error("Invalid target member provided.");
      }

      // Get the permissions of the target member
      const permissions = target.permissions;

      // Split permissions into two arrays for two fields
      const permissionEntries = Object.entries(permissions.serialize());
      const middleIndex = Math.ceil(permissionEntries.length / 2);
      const firstHalf = permissionEntries.slice(0, middleIndex);
      const secondHalf = permissionEntries.slice(middleIndex);

      // Create formatted permission strings with emojis
      const firstHalfFormatted = firstHalf
        .map(
          ([key, value]) =>
            `${
              value ? "<:On:1156568627911348354>" : "<:Off:1156568623213727794>"
            } ${key}`,
        )
        .join("\n");
      const secondHalfFormatted = secondHalf
        .map(
          ([key, value]) =>
            `${
              value ? "<:On:1156568627911348354>" : "<:Off:1156568623213727794>"
            } ${key}`,
        )
        .join("\n");

      // Count the number of allowed and denied permissions
      const allowedCount = permissionEntries.filter(
        ([_, value]) => value,
      ).length;
      const deniedCount = permissionEntries.filter(
        ([_, value]) => !value,
      ).length;

      // Create an embed with two fields to display the permissions
      const permissionsEmbed = new EmbedBuilder()
        .setAuthor({
          name: target.user.username,
          iconURL: target.user.displayAvatarURL(),
        })
        .setColor(colors.Information)
        .setDescription(
          `<:On:1156563793711730769> Allowed: ${allowedCount} | <:Off:1156563789081227356> Denied: ${deniedCount}\nBelow are the all enabled and disabled permissions for <@${target.user.id}>.`,
        )
        .setFields(
          {
            name: `🔒 Permissions For ${target.user.username}`,
            value: firstHalfFormatted,
            inline: true,
          },
          {
            name: "‎ ",
            value: secondHalfFormatted,
            inline: true,
          },
        )
        .setFooter({
          text: `/permissions | Requested by ${message.author.username}`,
        });

      message.reply({ embeds: [permissionsEmbed] });
    } catch (error) {
      console.log(error); //remove this after  you are done
      errorsEmbed.setDescription(`An error occurred: ${error.message}`);
      message.reply({ embeds: [errorsEmbed] });
    }
  },
};
