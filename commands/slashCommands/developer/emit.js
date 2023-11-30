const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  Client,
  ChatInputCommandInteraction,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("emit")
    .setDescription("Emit the guildMemberAdd/Remove events.")
    .setDMPermission(false)
    .addStringOption((option) =>
      option
        .setName("event")
        .setDescription("name of the event u wanna emit.")
        .addChoices(
          { name: `guildMemberAdd`, value: `guildMemberAdd` },
          { name: `guildMemberRemove`, value: `guildMemberRemove` }
        )
    ),

  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  execute(interaction, client) {
    try {
      const choice = interaction.options.getString("event");

      if (interaction.user.id !== "1177808839484133437") {
        interaction.reply({
          content: "This command is only available to devs.",
          ephemeral: true,
        });
        return;
      }
      client.emit(choice, interaction.member);

      interaction.reply({
        content: "Emitted GuildMemberAdd",
        ephemeral: true,
      });
    } catch (error) {
      console.log(error);
    }
  },
};
