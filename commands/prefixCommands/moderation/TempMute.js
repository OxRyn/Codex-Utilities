const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const colors = require("../../../utils/colors.js");
const MuteRole = require("../../../schemas/muteRole.js");
const Database = require("../../../schemas/infractions.js");
const ms = require("ms");

module.exports = {
  name: "tempmute",
  description: "🔇 Temporarily mute a member in the guild.",
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
    const target = message.mentions.members.first();

    if (!target) {
      return message.channel.send("Please mention a member to timeout.");
    }

    const duration = args[1];

    if (!duration) {
      return message.channel.send(
        "Please provide a valid duration for the timeout."
      );
    }

    const reason = args.slice(2).join(" ") || "No reason provided";

    const errorsEmbed = new EmbedBuilder()
      .setAuthor({
        name: "Could not tempmute member due to",
        iconURL:
          "https://media.discordapp.net/attachments/1147489563648983060/1156561255138611281/amnaError1.png?ex=65156b1b&is=6514199b&hm=4723faa01a55c017f652fd75496420e113871bc20646ccafb95769ab6abaa4f1&=",
      })
      .setColor(colors.Error);

    let userData; // Declare the userData variable here

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
            errorsEmbed.setDescription(
              "Mute role is not set for this guild. Use `/setmute` to set the mute role for this guild."
            ),
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

      // Record the infraction in the database
      const newInfractionObject = {
        IssuerID: member.id,
        IssuerTag: member.tag,
        TargetID: target.user.id,
        TargetTag: target.user.tag,
        Action: "Tempmute",
        Reason: reason,
        Duration: duration,
        Date: Date.now(),
      };

      userData = await Database.findOne({
        Guild: guild.id,
        User: target.user.id,
      });
      if (!userData) {
        userData = await Database.create({
          Guild: guild.id,
          User: target.user.id,
          Infractions: [newInfractionObject],
        });
      } else {
        userData.Infractions.push(newInfractionObject);
        await userData.save();
      }

      // Add the mute role to the target member
      await target.roles.add(muteRole);

      const bot = client.user;
      const botName = bot.username;
      const botAvatarURL = bot.avatarURL();
      const successEmbed = new EmbedBuilder()
        .setAuthor({ name: `${botName}`, iconURL: `${botAvatarURL}` })
        .setColor(colors.TempMute)
        .setDescription(
          [
            `🔇 ${target} was muted for ${ms(ms(duration), {
              long: true,
            })} by ${member}`,
            `📊 Bringing their total infractions to **${userData.Infractions.length} Infractions.**`,
            `📝 **Reason:** \`${reason}\``,
          ].join("\n")
        )
        .setTimestamp();

      message.reply({ embeds: [successEmbed] });

      // Automatically unmute the member after the specified duration
      setTimeout(async () => {
        await target.roles.remove(muteRole);
      }, ms(duration));
    } catch (error) {
      console.error("Error occurred while tempmuting member:", error);
      message.reply({
        embeds: [
          errorsEmbed.setDescription(
            "Could not tempmute member due to an error."
          ),
        ],
      });
    }
  },
};
