const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const MuteRole = require("../../../schemas/muteRole.js");
const Database = require("../../../schemas/infractions.js");
const ms = require("ms");
const colors = require("../../../utils/colors.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tempmute")
    .setDescription("🔇 Temporarily mute a member in the guild.")
    .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
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
        .setDescription("Specify the mute duration (e.g., 1h, 30m).")
        .setRequired(true)
    )
    .addStringOption((options) =>
      options
        .setName("reason")
        .setDescription("Provide a reason for the tempmute.")
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
        return interaction.reply({
          embeds: [
            errorsEmbed.setDescription("Invalid target member provided."),
          ],
          ephemeral: true,
        });
      }

      // Get the mute role for the guild from the database
      const muteRoleData = await MuteRole.findOne({ Guild: guild.id });

      if (!muteRoleData || !muteRoleData.RoleId) {
        return interaction.reply({
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
        return interaction.reply({
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
        IssuerTag: member.user.tag,
        TargetID: target.id,
        TargetTag: target.user.tag,
        Action: "Tempmute",
        Reason: reason,
        Duration: duration,
        Date: Date.now(),
      };

      userData = await Database.findOne({
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

      // Add the mute role to the target member
      await target.roles.add(muteRole);

      const bot = interaction.client.user;
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

      interaction.reply({ embeds: [successEmbed] });

      // Automatically unmute the member after the specified duration
      setTimeout(async () => {
        await target.roles.remove(muteRole);
      }, ms(duration));
    } catch (error) {
      console.error("Error occurred while tempmuting member:", error);
      interaction.reply({
        embeds: [
          errorsEmbed.setDescription(
            "Could not tempmute member due to an error."
          ),
        ],
      });
    }
  },
};
