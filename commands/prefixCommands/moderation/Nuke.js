const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const colors = require("../../../utils/colors.js");

module.exports = {
  name: "nuke",
  description: "💣 Nuke the current channel.",
  aliases: [],
  run: async (client, message) => {
    if (
      !message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)
    ) {
      return message.channel.send(
        `${client.emotes.error} | You do not have the necessary permissions to use this command.`,
      );
    }

    const { channel, author, guild } = message;

    const errorsEmbed = new EmbedBuilder()
      .setAuthor({
        name: "Could not nuke channel due to",
        iconURL:
          "https://media.discordapp.net/attachments/1147489563648983060/1156561255138611281/amnaError1.png?ex=65156b1b&is=6514199b&hm=4723faa01a55c017f652fd75496420e113871bc20646ccafb95769ab6abaa4f1&=",
      })
      .setColor(colors.Error);

    try {
      const parentCategory = channel.parent;

      await channel.clone().then((newChannel) => {
        if (parentCategory) {
          newChannel.setParent(parentCategory.id);
          newChannel.setPosition(channel.position);
        }

        channel.delete();

        newChannel.send(`Channel nuked by \`${author.username}\`! `);
      });
    } catch (error) {
      console.error("Error occurred while nuking the channel:", error);
      message.reply({
        embeds: [
          errorsEmbed.setDescription(
            "Could not nuke the channel due to an error.",
          ),
        ],
      });
    }
  },
};
