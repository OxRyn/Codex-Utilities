const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");

const Database = require("../../../schemas/infractions.js");
const colors = require("../../../utils/colors.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("softban")
    .setDescription("🔨 Softban a member from the guild (ban and then unban).")
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
        .setDescription("📝 Provide a reason for the softban.")
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
        name: "Could not softban member due to",
        iconURL:
          "https://media.discordapp.net/attachments/1147489563648983060/1156561255138611281/amnaError1.png?ex=65156b1b&is=6514199b&hm=4723faa01a55c017f652fd75496420e113871bc20646ccafb95769ab6abaa4f1&=",
      })
      .setColor(colors.Error);

    if (!target)
      return interaction.reply({
        embeds: [
          errorsEmbed.setDescription("Member has most likely left the guild."),
        ],
        ephemeral: true,
      });

    if (!target.manageable || !target.moderatable)
      errorsArray.push("Selected target is not moderatable by this bot.");

    if (member.roles.highest.position < target.roles.highest.position)
      errorsArray.push("Selected member has a higher role than you.");

    if (errorsArray.length)
      return interaction.reply({
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
      interaction.reply({
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
      IssuerTag: member.user.tag,
      TargetID: target.id,
      TargetTag: target.user.tag,
      Action: "Softban",
      Reason: reason, // Include the reason here
      Date: Date.now(),
    };

    let userData = await Database.findOne({ Guild: guild.id, User: target.id });
    if (!userData)
      userData = await Database.create({
        Guild: guild.id,
        User: target.id,
        Infractions: [newInfractionObject],
      });
    else
      userData.Infractions.push(newInfractionObject) && (await userData.save());

    const bot = interaction.client.user;
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

    return interaction.reply({ embeds: [successEmbed] });
  },
};
