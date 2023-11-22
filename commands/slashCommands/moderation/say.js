const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const colors = require("../../../utils/colors.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dm")
    .setDescription("💬 Send a custom DM to a user.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("👤 The user to send a DM to.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("✉️ The message to send in the DM.")
        .setRequired(true)
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { options, user } = interaction;
    const targetUser = options.getUser("user");
    const messageContent = options.getString("message");

    try {
      await targetUser.send(messageContent);
      const successEmbed = new EmbedBuilder()
        .setColor(colors.Success)
        .setDescription(`Successfully sent a DM to ${targetUser.tag}.`);
      interaction.reply({ embeds: [successEmbed], ephemeral: true });
    } catch (error) {
      console.error("Error occurred while sending DM:", error);
      const errorEmbed = new EmbedBuilder()
        .setAuthor({
          name: "Could not DM member due to",
          iconURL:
            "https://media.discordapp.net/attachments/1147489563648983060/1156561255138611281/amnaError1.png?ex=65156b1b&is=6514199b&hm=4723faa01a55c017f652fd75496420e113871bc20646ccafb95769ab6abaa4f1&=",
        })
        .setColor(colors.Error)
        .setDescription(
          `Failed to send a DM to ${targetUser.tag}. Please check their DM settings or try again later.`
        );
      interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
