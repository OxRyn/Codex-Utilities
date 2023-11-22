const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const ModRole = require("../../../schemas/modrole.js");
const colors = require("../../../utils/colors.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("listmodroles")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDescription("🛡️ List all moderator roles added to the guild.")
    .setDMPermission(false),

  /**
   * @param {ChatInputCommandInteraction} interaction
   * @returns
   */
  async execute(interaction) {
    const guildId = interaction.guild.id;

    try {
      const modRole = await ModRole.findOne({ guildId });

      const errorsEmbed = new EmbedBuilder()
        .setAuthor({
          name: "Could not fetch modroles due to",
          iconURL:
            "https://media.discordapp.net/attachments/1147489563648983060/1156561255138611281/amnaError1.png?ex=65156b1b&is=6514199b&hm=4723faa01a55c017f652fd75496420e113871bc20646ccafb95769ab6abaa4f1&=",
        })
        .setColor(colors.Error);

      if (!modRole || !modRole.modRooleIds.length) {
        return interaction.reply({
          embeds: [
            errorsEmbed.setDescription(
              "🛡️ There are no moderator roles added in this server."
            ),
          ],
          ephemeral: true,
        });
      }

      // Fetch all members of the guild
      const members = await interaction.guild.members.fetch();

      const modRolesEmbed = new EmbedBuilder()
        .setAuthor({
          name: `${interaction.guild.name} | ${interaction.guild.id}`,
          iconURL: `${interaction.guild.iconURL({ dynamic: true })}`,
        })
        .setTitle(`${interaction.guild.name}'s Moderator Roles`)
        .setColor(colors.Default)
        .addFields(
          {
            name: "Set New Role",
            value:
              "Use `/set-modrole` to add a new moderator role to the database.",
          },
          {
            name: "Add Mod",
            value: "Use `/addmod` to add a moderator role to a selected user.",
          }
        )
        .setFooter({
          text: `/listmodroles | Requested by ${interaction.user.username}`,
        })
        .setTimestamp();

      const description = [];
      description.push(
        "```\n| Moderator Role                 | Number of Users |"
      );
      description.push("|----------------------------|-----------------|");

      for (const roleId of modRole.modRooleIds) {
        const role = interaction.guild.roles.cache.get(roleId);
        if (role) {
          // Filter members who have the current role
          const membersWithRole = members.filter((member) =>
            member.roles.cache.has(roleId)
          );

          const membersCount = membersWithRole.size;
          description.push(
            `| ${role.name.padEnd(30)} | ${membersCount
              .toString()
              .padStart(15)} |`
          );
        }
      }
      description.push("```");

      modRolesEmbed.setDescription(description.join("\n"));

      interaction.reply({ embeds: [modRolesEmbed] });
    } catch (error) {
      interaction.reply(
        `An error occurred while listing moderator roles.\n${error}`
      );
    }
  },
};
