const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const Database = require("../../../schemas/infractions.js");
const ms = require("ms");
const colors = require("../../../utils/colors.js");

module.exports = {
  name: "ban",
  description: "🔨 Ban a member from the guild.",
  aliases: [],
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.channel.send(
        `${client.emotes.error} | You do not have the necessary permissions to use this command.`,
      );
    }

    const target = message.mentions.members.first();

    if (!target) {
      return message.channel.send("Please mention a member to ban.");
    }

    const reason = args.slice(1).join(" ") || "No reason provided"; // Change the slicing index to 1
    const CommandAuthor = message.author;

    const errorsArray = [];

    const errorsEmbed = new EmbedBuilder()
      .setAuthor({
        name: "Could not ban member due to",
        iconURL:
          "https://media.discordapp.net/attachments/1147489563648983060/1156561255138611281/amnaError1.png?ex=65156b1b&is=6514199b&hm=4723faa01a55c017f652fd75496420e113871bc20646ccafb95769ab6abaa4f1&=",
      })
      .setColor(colors.Error);

    try {
      if (!target) {
        throw new Error("Member has most likely left the guild.");
      }

      if (!target.manageable || !target.moderatable) {
        errorsArray.push("Selected target is not moderatable by this bot.");
      }

      if (target.roles.highest.position < target.roles.highest.position) {
        errorsArray.push("Selected member has a higher role than you.");
      }

      if (errorsArray.length) {
        throw new Error(errorsArray.join("\n"));
      }

      await target.ban({ reason: reason });

      const newInfractionObject = {
        IssuerID: message.author.id,
        IssuerTag: message.author.tag,
        TargetID: target.id,
        TargetTag: target.tag,
        Action: "Ban",
        Reason: reason, // Include the reason here
        Date: Date.now(),
      };

      let userData = await Database.findOne({
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
        .setAuthor({ name: `✅ ${botName}`, iconURL: `${botAvatarURL}` })
        .setColor(colors.Ban)
        .setDescription(
          [
            `✅ ${target} was banned by ${message.author}`,
            `📊 Bringing their total infractions to **${userData.Infractions.length} Infractions.**`,
            `📝 **Reason:** \`${reason}\``,
          ].join("\n"),
        )
        .setTimestamp();

      return message.reply({ embeds: [successEmbed] });
    } catch (error) {
      errorsEmbed.setDescription(`${error.message}`);
      return message.reply({ embeds: [errorsEmbed], ephemeral: true });
    }
  },
};
