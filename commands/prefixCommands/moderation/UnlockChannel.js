const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const colors = require("../../../utils/colors.js");

module.exports = {
  name: "unlock",
  description: "🔓 Unlock a channel.",
  aliases: [],
  run: async (client, message, args) => {
    if (
      !message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)
    ) {
      return message.channel.send(
        `${client.emotes.error} | You do not have the necessary permissions to use this command.`
      );
    }
    const targetChannel = message.mentions.channels.first() || message.channel;

    const errorsEmbed = new EmbedBuilder()
      .setAuthor({
        name: "Could not lock the channel due to",
        iconURL:
          "https://media.discordapp.net/attachments/1147489563648983060/1156561255138611281/amnaError1.png?ex=65156b1b&is=6514199b&hm=4723faa01a55c017f652fd75496420e113871bc20646ccafb95769ab6abaa4f1&=",
      })
      .setColor(colors.Error);

    try {
      // Check if the target channel is not a voice channel
      if (targetChannel.type === "GUILD_VOICE") {
        return message.reply({
          embeds: [
            errorsEmbed.setDescription("Voice channels cannot be unlocked."),
          ],
          ephemeral: true,
        });
      }

      // Check if the target channel is already locked
      if (
        targetChannel.permissionOverwrites.cache
          .get(targetChannel.guild.id)
          ?.allow.has(PermissionsBitField.Flags.SendMessages)
      ) {
        return message.reply({
          embeds: [
            errorsEmbed.setDescription("The channel is already unlocked."),
          ],
          ephemeral: true,
        });
      }

      // Unlock the channel by allowing send messages permission
      await targetChannel.permissionOverwrites.edit(targetChannel.guild.id, {
        SendMessages: true,
      });

      const successEmbed = new EmbedBuilder()
        .setColor(colors.Success)
        .setDescription(
          `🔓 Channel ${targetChannel} has been unlocked by ${message.author}.`
        );

      message.reply({ embeds: [successEmbed], ephemeral: true });
    } catch (error) {
      console.error("Error occurred while unlocking the channel:", error);
      message.reply({
        embeds: [
          errorsEmbed.setDescription(
            "Could not unlock the channel due to an error."
          ),
        ],
      });
    }
  },
};
