const {
  SlashCommandBuilder,
  Client,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const colors = require("../../../utils/colors.js");
const AsciiTable = require("ascii-table");
const { Color } = require("coloras");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roleinfo")
    .setDescription("🏷️ Get information about a specific role.")
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("🔒 The role to get info")
        .setRequired(true)
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    // Get the role from the interaction options
    const role = interaction.options.getRole("role");

    // Check if the role exists
    if (!role) {
      return interaction.reply("❌ Role not found.");
    }
    try {
      const permList = role.permissions.toArray();
      const color = new Color(`${role.hexColor}`);

      // Create an ASCII table for permissions
      const permissionTable = new AsciiTable(`Permissions`);

      for (const permission of permList) {
        permissionTable.addRow(permission);
      }

      const embed = new EmbedBuilder()
        .setAuthor({
          name: interaction.guild.name,
          iconURL: interaction.guild.iconURL({ dynamic: true }),
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
          text: `/roleinfo | Requested by ${interaction.user.username}`,
        })
        .setTimestamp();

      // Send the role information as an embed
      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.log(error);
    }
  },
};
