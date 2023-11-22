const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const MuteRole = require("../../../schemas/muteRole.js");
const Database = require("../../../schemas/infractions.js");
const colors = require("../../../utils/colors.js");

module.exports = {
  name: "unmute",
  description: "🔊 Unmute a member in the guild.",
  aliases: [],
  run: async (client, message, args) => {
    if (
      !message.member.permissions.has(PermissionsBitField.Flags.MuteMembers)
    ) {
      return message.channel.send(
        `${client.emotes.error} | You do not have the necessary permissions to use this command.`
      );
    }

    const { guild, author } = message;
    const target = message.mentions.members.first();

    if (!target) {
      return message.channel.send("Please mention a member to unmute.");
    }

    const reason = args.slice(1).join(" ") || "No reason provided";

    const errorsEmbed = new EmbedBuilder()
      .setAuthor({
        name: "Could not unmute member due to",
        iconURL:
          "https://media.discordapp.net/attachments/1147489563648983060/1156561255138611281/amnaError1.png?ex=65156b1b&is=6514199b&hm=4723faa01a55c017f652fd75496420e113871bc20646ccafb95769ab6abaa4f1&=",
      })
      .setColor(colors.Error);

    try {
      // Check if the target member is valid
      if (!target) {
        return message.reply({
          embeds: [
            errorsEmbed.setDescription("Invalid target member provided."),
          ],
          ephemeral: true,
        });
      }

      // Get the mute role for the guild from the database
      const muteRoleData = await MuteRole.findOne({ Guild: guild.id });

      if (!muteRoleData || !muteRoleData.RoleId) {
        return message.reply({
          embeds: [
            errorsEmbed.setDescription("Mute role is not set for this guild."),
          ],
          ephemeral: true,
        });
      }

      const muteRole = guild.roles.cache.get(muteRoleData.RoleId);

      if (!muteRole) {
        return message.reply({
          embeds: [
            errorsEmbed.setDescription(
              "The configured mute role no longer exists in this guild."
            ),
          ],
          ephemeral: true,
        });
      }

      // Check if the target member has the mute role
      if (!target.roles.cache.has(muteRole.id)) {
        return message.reply({
          embeds: [
            errorsEmbed.setDescription(
              `${target} does not have the mute role.`
            ),
          ],
          ephemeral: true,
        });
      }

      // Remove the mute role from the target member
      await target.roles.remove(muteRole);

      const bot = client.user;
      const botName = bot.username;
      const botAvatarURL = bot.avatarURL();
      const successEmbed = new EmbedBuilder()
        .setAuthor({ name: `${botName}`, iconURL: `${botAvatarURL}` })
        .setColor(colors.Unmute)
        .setDescription(
          [
            `🔊 ${target} was unmuted by ${author}`,
            `📝 **Reason:** \`${reason}\``,
          ].join("\n")
        )
        .setTimestamp();

      message.reply({ embeds: [successEmbed] });
    } catch (error) {
      console.error("Error occurred while unmuting member:", error);
      message.reply({
        embeds: [
          errorsEmbed.setDescription(
            "Could not unmute member due to an error."
          ),
        ],
      });
    }
  },
};
