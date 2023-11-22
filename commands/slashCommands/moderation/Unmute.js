const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const MuteRole = require("../../../schemas/muteRole.js");
const colors = require("../../../utils/colors.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("🔊 Unmute a member in the guild.")
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
        .setName("reason")
        .setDescription("Provide a reason for the unmute.")
        .setMaxLength(512)
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { options, guild, member } = interaction;
    const target = options.getMember("target");
    const reason = options.getString("reason") || "No reason provided.";

    const errorsEmbed = new EmbedBuilder()
      .setAuthor({
        name: "Could not unmute member due to",
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

      // Get the mute role for the guild from the database
      const muteRoleData = await MuteRole.findOne({ Guild: guild.id });

      if (!muteRoleData || !muteRoleData.RoleId) {
        return interaction.reply({
          embeds: [
            errorsEmbed.setDescription("Mute role is not set for this guild."),
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

      // Check if the target member has the mute role
      if (!target.roles.cache.has(muteRole.id)) {
        return interaction.reply({
          embeds: [
            errorsEmbed.setDescription(
              `${target} does not have the mute role.`
            ),
          ],
          ephemeral: true,
        });
      }

      // Remove the mute role from the target member
      await target.roles.remove(muteRole);

      const bot = interaction.client.user;
      const botName = bot.username;
      const botAvatarURL = bot.avatarURL();
      const successEmbed = new EmbedBuilder()
        .setAuthor({ name: `${botName}`, iconURL: `${botAvatarURL}` })
        .setColor(colors.Unmute)
        .setDescription(
          [
            `🔊 ${target} was unmuted by ${member}`,
            `📝 **Reason:** \`${reason}\``,
          ].join("\n")
        )
        .setTimestamp();

      interaction.reply({ embeds: [successEmbed] });
    } catch (error) {
      console.error("Error occurred while unmuting member:", error);
      interaction.reply({
        embeds: [
          errorsEmbed.setDescription(
            "Could not unmute member due to an error."
          ),
        ],
      });
    }
  },
};
