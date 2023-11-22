const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const Database = require("../../../schemas/infractions.js");
const ms = require("ms");
const colors = require("../../../utils/colors.js");

module.exports = {
  name: "timeout",
  description: "⌛ Restrict a member's ability to communicate.",
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

    const errorsArray = [];

    const errorsEmbed = new EmbedBuilder()
      .setAuthor({
        name: "Could not timeout member due to",
        iconURL:
          "https://media.discordapp.net/attachments/1147489563648983060/1156561255138611281/amnaError1.png?ex=65156b1b&is=6514199b&hm=4723faa01a55c017f652fd75496420e113871bc20646ccafb95769ab6abaa4f1&=",
      })
      .setColor(colors.Error);

    if (!target)
      return message.reply({
        embeds: [
          errorsEmbed.setDescription("Member has most likely left the guild."),
        ],
        ephemeral: true,
      });

    if (!ms(duration) || ms(duration) > ms("28d"))
      errorsArray.push("Invalid or above 28d limit time provided.");

    if (errorsArray.length)
      return message.reply({
        embeds: [errorsEmbed.setDescription(errorsArray.join("\n"))],
        ephemeral: true,
      });

    target.timeout(ms(duration), reason).catch((err) => {
      message.reply({
        embeds: [
          errorsEmbed.setDescription(
            "Could not timeout user due to an uncommon error."
          ),
        ],
      });
      return console.log("Error occurred in TIMEOUT.JS", err);
    });

    const newInfractionObject = {
      IssuerID: member.id,
      IssuerTag: member.tag,
      TargetID: target.user.id,
      TargetTag: target.user.tag,
      Action: "Timeout",
      Reason: reason, // Include the reason here
      Date: Date.now(),
    };

    let userData = await Database.findOne({ Guild: guild.id, User: target.id });
    if (!userData)
      userData = await Database.create({
        Guild: guild.id,
        User: target.user.id,
        Infractions: [newInfractionObject],
      });
    else
      userData.Infractions.push(newInfractionObject) && (await userData.save());

    const bot = client.user;
    const botName = bot.username;
    const botAvatarURL = bot.avatarURL();
    const successEmbed = new EmbedBuilder()
      .setAuthor({ name: `${botName}`, iconURL: `${botAvatarURL}` })
      .setColor(colors.Timeout)
      .setDescription(
        [
          `⌛ ${target} was issued a timeout for ${ms(ms(duration), {
            long: true,
          })} by ${member}`,
          `📊 Bringing their total infractions to **${userData.Infractions.length} Infractions.**`,
          `📝 **Reason:** \`${reason}\``,
        ].join("\n")
      )
      .setTimestamp();

    return message.reply({ embeds: [successEmbed] });
  },
};
