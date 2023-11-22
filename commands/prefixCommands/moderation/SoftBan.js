const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const Database = require("../../../schemas/infractions.js");
const colors = require("../../../utils/colors.js");

module.exports = {
  name: "softban",
  description: "🔨 Softban a member from the guild (ban and then unban).",
  aliases: [],
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.channel.send(
        `${client.emotes.error} | You do not have the necessary permissions to use this command.`
      );
    }
    const { author, guild } = message;

    const member = author;
    const target = message.mentions.members.first();

    if (!target) {
      return message.channel.send("Please mention a member to ban.");
    }

    const reason = args.slice(1).join(" ") || "No reason provided"; // Change the slicing index to 1

    const errorsArray = [];

    const errorsEmbed = new EmbedBuilder()
      .setAuthor({
        name: "Could not softban member due to",
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

    if (!target.manageable || !target.moderatable)
      errorsArray.push("Selected target is not moderatable by this bot.");

    if (errorsArray.length)
      return message.reply({
        embeds: [errorsEmbed.setDescription(errorsArray.join("\n"))],
        ephemeral: true,
      });

    // Softban (ban and then unban)
    try {
      await target.ban({
        deleteMessageDays: 7, // Delete messages from the past 7 days
        reason: reason,
      });
      await guild.members.unban(target.id, "Softban");
    } catch (err) {
      message.reply({
        embeds: [
          errorsEmbed.setDescription(
            "Could not softban user due to an uncommon error."
          ),
        ],
      });
      console.error("Error occurred in SOFTBAN.js command", err);
    }

    const newInfractionObject = {
      IssuerID: member.id,
      IssuerTag: member.tag,
      TargetID: target.user.id,
      TargetTag: target.user.tag,
      Action: "Softban",
      Reason: reason, // Include the reason here
      Date: Date.now(),
    };

    let userData = await Database.findOne({
      Guild: guild.id,
      User: target.user.id,
    });
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
      .setColor(colors.Ban)
      .setDescription(
        [
          `✅ ${target} was softbanned by ${member}`,
          `📊 Bringing their total infractions to **${userData.Infractions.length} Infractions.**`,
          `📝 **Reason:** \`${reason}\``,
        ].join("\n")
      )
      .setTimestamp();

    return message.reply({ embeds: [successEmbed] });
  },
};
