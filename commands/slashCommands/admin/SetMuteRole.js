const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const MuteRole = require("../../../schemas/muteRole.js");
const colors = require("../../../utils/colors.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setmute")
    .setDescription("🔇 Set the mute role for the guild.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setDMPermission(false)
    .addRoleOption((options) =>
      options
        .setName("mute_role")
        .setDescription("🔊 Select the mute role for the guild.")
        .setRequired(true)
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { options, guild } = interaction;
    const muteRole = options.getRole("mute_role");

    const errorsEmbed = new EmbedBuilder()
      .setAuthor({
        name: "❌ Unable to set the mute role due to",
      })
      .setColor(colors.Error);

    try {
      // Check if the provided mute role is valid
      if (!muteRole) {
        return interaction.reply({
          embeds: [
            errorsEmbed.setDescription("❌ Invalid mute role provided."),
          ],
          ephemeral: true,
        });
      }

      // Store the mute role in the database
      await MuteRole.findOneAndUpdate(
        { Guild: guild.id },
        { RoleId: muteRole.id },
        { upsert: true }
      );

      const successEmbed = new EmbedBuilder()
        .setColor(colors.Success)
        .setDescription("✅ Mute role has been successfully set.");

      interaction.reply({ embeds: [successEmbed] });
    } catch (error) {
      console.error("Error occurred while setting the mute role:", error);
      interaction.reply({
        embeds: [
          errorsEmbed.setDescription(
            "❌ An error occurred while setting the mute role."
          ),
        ],
      });
    }
  },
};
