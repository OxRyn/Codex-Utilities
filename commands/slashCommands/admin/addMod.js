const { SlashCommandBuilder } = require("discord.js");
const {
  ActionRowBuilder,
  ButtonBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const ModRole = require("../../../schemas/modrole.js"); // Replace with the actual path to your Mongoose model

module.exports = {
  data: new SlashCommandBuilder()
    .setName("addmod")
    .setDescription("🛡️ Add a moderator role to a user.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Select the user to assign a moderator role.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const guildId = interaction.guild.id; // Get the guild ID

    // Fetch the list of moderator roles from the database
    const modRole = await ModRole.findOne({ guildId: guildId });

    if (!modRole || modRole.modRoleIds.length === 0) {
      return interaction.reply("There are no moderator roles available.");
    }

    // Create buttons for each moderator role
    const buttons = modRole.modRoleIds
      .map((roleId) => {
        const role = interaction.guild.roles.cache.get(roleId);

        if (!role) return null;

        const button = new ButtonBuilder()
          .setCustomId(`assign_role_${roleId}`)
          .setLabel(`Assign ${role.name}`)
          .setStyle(2);

        return button;
      })
      .filter((button) => button !== null);

    if (buttons.length === 0) {
      return interaction.reply("No valid moderator roles found.");
    }

    // Create an action row with the buttons
    const actionRow = new ActionRowBuilder().addComponents(buttons);

    // Send the message with buttons
    await interaction.reply({
      content:
        "Click the buttons below to assign a moderator role to the user:",
      components: [actionRow],
    });

    // Create a button collector filter
    const filter = (interaction) =>
      interaction.customId.startsWith("assign_role_") &&
      interaction.user.id === interaction.member.user.id;

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 60000,
    });

    collector.on("collect", async (buttonInteraction) => {
      const roleId = buttonInteraction.customId.replace("assign_role_", "");
      const role = interaction.guild.roles.cache.get(roleId);

      if (!role) return;

      const user = interaction.options.getUser("user");

      try {
        const member = await interaction.guild.members.fetch({
          user,
          cache: false,
        });
        await member.roles.add(roleId);
        await buttonInteraction.reply(
          `🛡️ Added the ${role.name} role to ${user.tag}.`
        );
        actionRow.components.forEach((button) => button.setDisabled(true));
        interaction.editReply({ components: [actionRow] });
      } catch (error) {
        console.error(error);
        await buttonInteraction.reply(
          "An error occurred while adding the role to the user."
        );
      }
    });
  },
};
