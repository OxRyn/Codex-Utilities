const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const Database = require("../../../schemas/infractions.js");
const ms = require("ms");
const colors = require("../../../utils/colors.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("🔨 Ban a member from the guild.")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false)
    .addUserOption((options) =>
      options
        .setName("target")
        .setDescription("🎯 Select the target member.")
        .setRequired(true)
    )
    .addStringOption((options) =>
      options
        .setName("reason")
        .setDescription("📝 Provide a reason for the ban.")
        .setMaxLength(512)
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { options, guild, member } = interaction;
    const target = options.getMember("target");
    const reason = options.getString("reason") || "Not specified.";

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

      if (member.roles.highest.position < target.roles.highest.position) {
        errorsArray.push("Selected member has a higher role than you.");
      }

      if (errorsArray.length) {
        throw new Error(errorsArray.join("\n"));
      }

      await target.ban({ reason: reason });

      const newInfractionObject = {
        IssuerID: member.id,
        IssuerTag: member.user.tag,
        TargetID: target.id,
        TargetTag: target.user.tag,
        Action: "Ban",
        Reason: reason, // Include the reason here
        Date: Date.now(),
      };

      let userData = await Database.findOne({
        Guild: guild.id,
        User: target.id,
      });
      if (!userData) {
        userData = await Database.create({
          Guild: guild.id,
          User: target.id,
          Infractions: [newInfractionObject],
        });
      } else {
        userData.Infractions.push(newInfractionObject);
        await userData.save();
      }

      const bot = interaction.client.user;
      const botName = bot.username;
      const botAvatarURL = bot.avatarURL();
      const successEmbed = new EmbedBuilder()
        .setAuthor({ name: `✅ ${botName}`, iconURL: `${botAvatarURL}` })
        .setColor(colors.Ban)
        .setDescription(
          [
            `✅ ${target} was banned by ${member}`,
            `📊 Bringing their total infractions to **${userData.Infractions.length} Infractions.**`,
            `📝 **Reason:** \`${reason}\``,
          ].join("\n")
        )
        .setTimestamp();

      return interaction.reply({ embeds: [successEmbed] });
    } catch (error) {
      console.error(`❌ Error in /ban command: ${error.message}`);
      errorsEmbed.setDescription(`${error.message}`);
      return interaction.reply({ embeds: [errorsEmbed], ephemeral: true });
    }
  },
};
