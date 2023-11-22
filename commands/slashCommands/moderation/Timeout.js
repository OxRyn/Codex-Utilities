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
    .setName("timeout")
    .setDescription("⌛ Restrict a member's ability to communicate.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)
    .addUserOption((options) =>
      options
        .setName("target")
        .setDescription("Select the target member.")
        .setRequired(true)
    )
    .addStringOption((options) =>
      options
        .setName("duration")
        .setDescription(
          "Specify a duration for this timeout (e.g., 1m, 1h, 1d)."
        )
        .setRequired(true)
    )
    .addStringOption((options) =>
      options
        .setName("reason")
        .setDescription("Provide a reason for this timeout.")
        .setMaxLength(512)
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */

  async execute(interaction) {
    const { options, guild, member } = interaction;
    const target = options.getMember("target");
    const duration = options.getString("duration");
    const reason = options.getString("reason") || "Not specified.";

    const errorsArray = [];

    const errorsEmbed = new EmbedBuilder()
      .setAuthor({
        name: "Could not timeout member due to",
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

    if (!ms(duration) || ms(duration) > ms("28d"))
      errorsArray.push("Invalid or above 28d limit time provided.");

    if (!target.manageable || !target.moderatable)
      errorsArray.push("The selected target cannot be managed by this bot.");

    if (member.roles.highest.position < target.roles.highest.position)
      errorsArray.push("The selected member has a higher role than you.");

    if (errorsArray.length)
      return interaction.reply({
        embeds: [errorsEmbed.setDescription(errorsArray.join("\n"))],
        ephemeral: true,
      });

    target.timeout(ms(duration), reason).catch((err) => {
      interaction.reply({
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
      IssuerTag: member.user.tag,
      TargetID: target.id,
      TargetTag: target.user.tag,
      Action: "Timeout",
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

    return interaction.reply({ embeds: [successEmbed] });
  },
};
