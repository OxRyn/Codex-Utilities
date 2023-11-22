const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const ModRole = require("../../../schemas/modrole.js"); // Replace with the actual path to your Mongoose model

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add-modrole")
    .setDescription("🛡️ Add a role as a moderator role to the database.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("Select the role to add as a moderator role.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const guildId = interaction.guild.id;

    try {
      // Check if the role exists in the guild
      const role = interaction.options.getRole("role");

      if (!role) {
        return interaction.reply(
          "The provided role does not exist in this server."
        );
      }

      // Find or create the ModRole document for the guild
      let modRole = await ModRole.findOne({ guildId });

      if (!modRole) {
        modRole = new ModRole({ guildId });
      }

      // Check if the role is already in the mod roles array
      if (modRole.modRoleIds.includes(role.id)) {
        return interaction.reply(
          "🛡️ This role is already added as a moderator role."
        );
      }

      // Add the role to the mod roles array
      modRole.modRoleIds.push(role.id);

      // Save the updated modRole document
      await modRole.save();

      interaction.reply(
        `🛡️ The role "${role.name}" has been added as a moderator role.`
      );
    } catch (error) {
      console.error(error);
      interaction.reply(
        "An error occurred while adding the moderator role to the database."
      );
    }
  },
};
