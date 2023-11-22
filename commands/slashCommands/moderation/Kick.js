const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const Database = require("../../../schemas/infractions.js");
const colors = require("../../../utils/colors.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("👢 Kick a member from the guild.")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
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
        .setDescription("📝 Provide a reason for the kick.")
        .setMaxLength(512)
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { options, guild, member } = interaction;
    const target = options.getMember("target");
    const reason = options.getString("reason") || "No reason provided.";

    const errorsEmbed = new EmbedBuilder()
      .setAuthor({
        name: "Could not kick member due to",
        iconURL:
          "https://media.discordapp.net/attachments/1147489563648983060/1156561255138611281/amnaError1.png?ex=65156b1b&is=6514199b&hm=4723faa01a55c017f652fd75496420e113871bc20646ccafb95769ab6abaa4f1&=",
      })
      .setColor(colors.Error);

    try {
      // Check if the target member is valid
      if (!target) {
        return interaction.reply({
          embeds: [
            errorsEmbed.setDescription("Invalid target member provided."),
          ],
          ephemeral: true,
        });
      }

      // Kick the target member
      await target.kick(reason);

      // Record the infraction in the database
      const newInfractionObject = {
        IssuerID: member.id,
        IssuerTag: member.user.tag,
        TargetID: target.id,
        TargetTag: target.user.tag,
        Action: "Kick",
        Reason: reason,
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
        .setAuthor({ name: `${botName}`, iconURL: `${botAvatarURL}` })
        .setColor(colors.Kick)
        .setDescription(
          [
            `✅ ${target} was kicked by ${member}`,
            `📊 Bringing their total infractions to **${userData.Infractions.length} Infractions.**`,
            `📝 **Reason:** \`${reason}\``,
          ].join("\n")
        )
        .setTimestamp();

      interaction.reply({ embeds: [successEmbed] });
    } catch (error) {
      console.error("Error occurred while kicking member:", error);
      interaction.reply({
        embeds: [
          errorsEmbed.setDescription("Could not kick member due to an error."),
        ],
      });
    }
  },
};
