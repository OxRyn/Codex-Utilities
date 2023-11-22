const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const colors = require("../../../utils/colors.js");

module.exports = {
  name: "lock",
  description: "🔒 Lock a channel.",
  aliases: [],
  run: async (client, message, args) => {
    if (
      !message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)
    ) {
      return message.channel.send(
        `${client.emotes.error} | You do not have the necessary permissions to use this command.`,
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
            errorsEmbed.setDescription(" Voice channels cannot be locked."),
          ],
          ephemeral: true,
        });
      }

      // Check if the target channel is already locked
      if (
        targetChannel.permissionOverwrites.cache
          .get(targetChannel.guild.id)
          ?.deny.has(PermissionsBitField.Flags.SendMessages)
      ) {
        return message.reply({
          embeds: [
            errorsEmbed.setDescription("The channel is already locked."),
          ],
          ephemeral: true,
        });
      }

      // Lock the channel by denying send messages permission
      await targetChannel.permissionOverwrites.edit(targetChannel.guild.id, {
        SendMessages: false,
      });

      const successEmbed = new EmbedBuilder()
        .setColor(colors.Alert)
        .setDescription(
          `✅ Channel ${targetChannel} has been locked by ${message.author}.`,
        );

      message.reply({ embeds: [successEmbed], ephemeral: true });
    } catch (error) {
      console.error("Error occurred while locking the channel:", error);
      message.reply({
        embeds: [
          errorsEmbed.setDescription(
            "Could not lock the channel due to an error.",
          ),
        ],
      });
    }
  },
};
