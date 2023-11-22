const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const colors = require("../../../utils/colors.js");
const Database = require("../../../schemas/infractions.js");

module.exports = {
  name: "warn",
  description: "⚠️ Warn a member in the guild.",
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

    const reason = args.slice(2).join(" ") || "No reason provided";

    const errorsEmbed = new EmbedBuilder()
      .setAuthor({
        name: "Could not warn member due to",
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

      // Record the warning in the database
      const newInfractionObject = {
        IssuerID: member.id,
        IssuerTag: member.tag,
        TargetID: target.user.id,
        TargetTag: target.user.tag,
        Action: "Warn",
        Reason: reason,
        Date: Date.now(),
      };

      let userData = await Database.findOne({
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

      const bot = client.user;
      const botName = bot.username;
      const botAvatarURL = bot.avatarURL();
      const successEmbed = new EmbedBuilder()
        .setAuthor({ name: `${botName}`, iconURL: `${botAvatarURL}` })
        .setColor(colors.Warn)
        .setDescription(
          [
            `⚠️ ${target} has been warned by ${member}`,
            `📊 Bringing their total infractions to **${userData.Infractions.length} Infractions.**`,
            `📝 **Reason:** \`${reason}\``,
          ].join("\n")
        )
        .setTimestamp();

      message.reply({ embeds: [successEmbed] });
    } catch (error) {
      console.error("Error occurred while warning member:", error);
      message.reply({
        embeds: [
          errorsEmbed.setDescription("Could not warn member due to an error."),
        ],
      });
    }
  },
};
