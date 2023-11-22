const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const ModRole = require("../../../schemas/modrole.js"); // Replace with the actual path to your Mongoose model

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remove-modrole")
    .setDescription("❌ Remove a moderator role from the database.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("The role to remove as a moderator role.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const guildId = interaction.guild.id;
    const roleToRemove = interaction.options.getRole("role");

    try {
      // Find the ModRole document for the guild
      const modRole = await ModRole.findOne({ guildId });

      if (!modRole) {
        return interaction.reply(
          "❌ There are no moderator roles added in this server."
        );
      }

      // Check if the provided role is in the mod roles array
      const roleIndex = modRole.modRooleIds.indexOf(roleToRemove.id);

      if (roleIndex === -1) {
        return interaction.reply(
          "❌ The provided role is not added as a moderator role."
        );
      }

      // Remove the role from the mod roles array
      modRole.modRooleIds.splice(roleIndex, 1);

      // Save the updated modRole document
      await modRole.save();

      interaction.reply(
        `✅ The role "${roleToRemove.name}" has been removed from the moderator roles.`
      );
    } catch (error) {
      console.error(error);
      interaction.reply(
        "❌ An error occurred while removing the moderator role from the database."
      );
    }
  },
};
