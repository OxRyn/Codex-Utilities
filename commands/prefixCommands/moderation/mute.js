const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const MuteRole = require("../../../schemas/muteRole.js");
const Database = require("../../../schemas/infractions.js");
const colors = require("../../../utils/colors.js");

module.exports = {
  name: "mute",
  description: "🔇 Mute a member in the guild.",
  aliases: [],
  run: async (client, message, args) => {
    if (
      !message.member.permissions.has(PermissionsBitField.Flags.MuteMembers)
    ) {
      return message.channel.send(
        `${client.emotes.error} | You do not have the necessary permissions to use this command.`,
      );
    }

    const target = message.mentions.members.first();

    if (!target) {
      return message.channel.send("Please mention a member to mute.");
    }

    const reason = args.slice(1).join(" ") || "No reason provided";

    const errorsEmbed = new EmbedBuilder()
      .setAuthor({
        name: "Could not mute member due to",
        iconURL:
          "https://media.discordapp.net/attachments/1147489563648983060/1156561255138611281/amnaError1.png?ex=65156b1b&is=6514199b&hm=4723faa01a55c017f652fd75496420e113871bc20646ccafb95769ab6abaa4f1&=",
      })
      .setColor(colors.Error);

    let userData; // Declare the userData variable outside the try block

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
      const muteRoleData = await MuteRole.findOne({ Guild: message.guild.id });

      if (!muteRoleData || !muteRoleData.RoleId) {
        return message.reply({
          embeds: [
            errorsEmbed.setDescription(
              "Mute role is not set for this guild. Use `/setmute` to set the muterole for this guild.",
            ),
          ],
          ephemeral: true,
        });
      }

      const muteRole = message.guild.roles.cache.get(muteRoleData.RoleId);

      if (!muteRole) {
        return message.reply({
          embeds: [
            errorsEmbed.setDescription(
              "The configured mute role no longer exists in this guild.",
            ),
          ],
          ephemeral: true,
        });
      }

      // Add the mute role to the target member
      await target.roles.add(muteRole);

      // Record the infraction in the database
      const newInfractionObject = {
        IssuerID: message.author.id,
        IssuerTag: message.author.tag,
        TargetID: target.id,
        TargetTag: target.user.tag,
        Action: "Mute",
        Reason: reason, // Include the reason here
        Date: Date.now(),
      };

      userData = await Database.findOne({
        Guild: message.guild.id,
        User: target.id,
      });
      if (!userData) {
        userData = await Database.create({
          Guild: message.guild.id,
          User: target.id,
          Infractions: [newInfractionObject],
        });
      } else {
        userData.Infractions.push(newInfractionObject);
        await userData.save();
      }

      const bot = client.user;
      const botName = bot.username;
      const botAvatarURL = bot.avatarURL();
      const successEmbed = new EmbedBuilder()
        .setAuthor({ name: `${botName}`, iconURL: `${botAvatarURL}` })
        .setColor(colors.Mute)
        .setDescription(
          [
            `✅ ${target} was muted by ${message.author}`,
            `📊 Bringing their total infractions to **${userData.Infractions.length} Infractions.**`,
            `📝 **Reason:** \`${reason}\``,
          ].join("\n"),
        )
        .setTimestamp();

      message.reply({ embeds: [successEmbed] });
    } catch (error) {
      console.error("Error occurred while muting member:", error);
      message.reply({
        embeds: [
          errorsEmbed.setDescription("Could not mute member due to an error."),
        ],
      });
    }
  },
};
