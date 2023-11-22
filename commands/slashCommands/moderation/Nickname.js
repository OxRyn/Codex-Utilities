const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const colors = require("../../../utils/colors.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("nick")
    .setDescription("📛 Set a nickname for a user.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames)
    .setDMPermission(false)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("👤 Select the user to set the nickname for.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("nickname")
        .setDescription("✍️ Provide the new nickname for the user.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const targetUser = interaction.options.getUser("user");
    const newNickname = interaction.options.getString("nickname");

    // Check if the command was used in a guild (server).
    if (!interaction.guild) {
      return interaction.reply({
        content: "This command can only be used in a server (guild).",
        ephemeral: true,
      });
    }

    // Get the member object for the target user in the current guild.
    const member = interaction.guild.members.cache.get(targetUser.id);

    if (!member) {
      return interaction.reply({
        content: "The specified user is not a member of this server.",
        ephemeral: true,
      });
    }

    try {
      await member.setNickname(newNickname);

      const embed = new EmbedBuilder()
        .setColor(colors.Success)
        .setTitle("Nickname Set")
        .setDescription(
          `📛 Nickname set for ${member.user.username}: \`${newNickname}\``
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error("Error occurred while setting the nickname:", error);

      const embed = new EmbedBuilder()
        .setAuthor({
          name: "Could not nick member due to",
          iconURL:
            "https://media.discordapp.net/attachments/1147489563648983060/1156561255138611281/amnaError1.png?ex=65156b1b&is=6514199b&hm=4723faa01a55c017f652fd75496420e113871bc20646ccafb95769ab6abaa4f1&=",
        })
        .setColor(colors.Error)
        .setDescription("An error occurred while setting the nickname.");

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
