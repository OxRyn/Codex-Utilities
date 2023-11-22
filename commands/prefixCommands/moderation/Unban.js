const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const colors = require("../../../utils/colors.js");

module.exports = {
  name: "unban",
  description: "🔓 Unban a member from the guild.",
  aliases: [],
  run: async (client, message, args) => {
    const { guild, author } = message;
    const member = author;

    if (
      !message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)
    ) {
      return message.channel.send(
        `${client.emotes.error} | You do not have the necessary permissions to use this command.`
      );
    }

    const userId = args[0];

    const errorsEmbed = new EmbedBuilder()
      .setAuthor({
        name: "Could not unban member due to",
        iconURL:
          "https://media.discordapp.net/attachments/1147489563648983060/1156561255138611281/amnaError1.png?ex=65156b1b&is=6514199b&hm=4723faa01a55c017f652fd75496420e113871bc20646ccafb95769ab6abaa4f1&=",
      })
      .setColor(colors.Error);

    // Check if the user ID is valid
    if (!userId.match(/^\d+$/)) {
      return message.reply({
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

        message.reply({ embeds: [successEmbed] });
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

          message.reply({ embeds: [notBannedEmbed], ephemeral: true });
        } else {
          console.error("Error occurred in UNBAN.JS", err);
          message.reply({
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
