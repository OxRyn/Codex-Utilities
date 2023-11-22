const { EmbedBuilder } = require("discord.js");
const colors = require("../../../utils/colors.js");
const AsciiTable = require("ascii-table");
const { Color } = require("coloras");

module.exports = {
  name: "roleinfo",
  description: "🏷️ Get information about a specific role.",
  aliases: [],
  run: async (client, message) => {
    try {
      // Get the role mentions from the message
      const roleMentions = message.mentions.roles;

      // Check if any roles were mentioned
      if (roleMentions.size === 0) {
        return message.reply("❌ No role mentioned in the message.");
      }

      // Get the first mentioned role
      const role = roleMentions.first();
      const permList = role.permissions.toArray();
      const color = new Color(`${role.hexColor}`);

      // Create an ASCII table for permissions
      const permissionTable = new AsciiTable(`Permissions`);

      for (const permission of permList) {
        permissionTable.addRow(permission);
      }

      const embed = new EmbedBuilder()
        .setAuthor({
          name: message.guild.name,
          iconURL: message.guild.iconURL({ dynamic: true }),
        })
        .setColor(colors.Information)
        .setTitle(role.name.concat(` Role Info`))
        .setThumbnail(`${color.imageUrl}`)
        .setFields([
          { name: "Role Name", value: role.name, inline: true },
          { name: "Role ID", value: role.id, inline: true },
          { name: "Role Color", value: role.hexColor, inline: true },
          {
            name: "Role Mentionable?",
            value: `\`<@&${role.id}>\``,
            inline: true,
          },
          {
            name: "Role Created At",
            value: `<t:${(role.createdTimestamp / 1000).toFixed(0)}:f>`,
            inline: true,
          },
          { name: "Hoisted?", value: role.hoist ? "Yes" : "No", inline: true },
          {
            name: "Role Mentionable?",
            value: role.mentionable ? "Yes" : "No",
            inline: true,
          },
          {
            name: "Members",
            value: role.members.size ? "Yes" : "No",
            inline: true,
          },
          {
            name: "Role Position",
            value: role.position ? "Yes" : "No",
            inline: true,
          },
          {
            name: "Role Permissions",
            value: permList.length == 0 ? "No Permission" : permList.join(", "),
            inline: false,
          },
        ])
        .setFooter({
          text: `${process.env.PREFIX}roleinfo | Requested by ${message.author.username}`,
        })
        .setTimestamp();

      // Send the role information as an embed
      message.reply({ embeds: [embed] });
    } catch (error) {
      console.log(error);
    }
  },
};
