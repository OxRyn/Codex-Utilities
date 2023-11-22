const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const colors = require("../../../utils/colors.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("🔓 Unban a member from the guild.")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false)
    .addStringOption((options) =>
      options
        .setName("user_id")
        .setDescription("User ID of the member to unban.")
        .setRequired(true)
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { options, guild, member } = interaction;
    const userId = options.getString("user_id");

    const errorsEmbed = new EmbedBuilder()
      .setAuthor({
        name: "Could not unban member due to",
        iconURL:
          "https://media.discordapp.net/attachments/1147489563648983060/1156561255138611281/amnaError1.png?ex=65156b1b&is=6514199b&hm=4723faa01a55c017f652fd75496420e113871bc20646ccafb95769ab6abaa4f1&=",
      })
      .setColor(colors.Error);

    // Check if the user ID is valid
    if (!userId.match(/^\d+$/)) {
      return interaction.reply({
        embeds: [errorsEmbed.setDescription("Invalid user ID provided.")],
        ephemeral: true,
      });
    }

    // Attempt to unban the user by their ID
    guild.members
      .unban(userId)
      .then(() => {
        const successEmbed = new EmbedBuilder()
          .setColor(colors.Unban)
          .setDescription(
            `🔓 User with ID ${userId} has been unbanned by ${member}.`
          );

        interaction.reply({ embeds: [successEmbed] });
      })
      .catch((err) => {
        if (err.message === "Unknown Ban") {
          const notBannedEmbed = new EmbedBuilder()
            .setAuthor({
              name: `Alert`,
              iconURL:
                "https://media.discordapp.net/attachments/1147489563648983060/1159806148325670972/amnaAlert2.png?ex=65325ca5&is=651fe7a5&hm=0b71495ca8e4293c9cad7424b3327ccb42f6e669588ed4490e5bfe362dbc34e6&=",
            })
            .setColor(colors.Alert)
            .setDescription(`User with ID \`${userId}\` is not banned.`);

          interaction.reply({ embeds: [notBannedEmbed], ephemeral: true });
        } else {
          console.error("Error occurred in UNBAN.JS", err);
          interaction.reply({
            embeds: [
              errorsEmbed.setDescription(
                "Could not unban user due to an error."
              ),
            ],
            ephemeral: true,
          });
        }
      });
  },
};
