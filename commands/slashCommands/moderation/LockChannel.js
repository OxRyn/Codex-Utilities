const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  PermissionsBitField,
} = require("discord.js");
const colors = require("../../../utils/colors.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lock")
    .setDescription("🔒 Lock a channel.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false)
    .addChannelOption((options) =>
      options
        .setName("channel")
        .setDescription("📢 Select the channel to lock.")
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { options, channel, member } = interaction;
    const targetChannel = options.getChannel("channel") || channel;

    const errorsEmbed = new EmbedBuilder()
      .setAuthor({
        name: "Could not lock the channel due to",
        iconURL:
          "https://media.discordapp.net/attachments/1147489563648983060/1156561255138611281/amnaError1.png?ex=65156b1b&is=6514199b&hm=4723faa01a55c017f652fd75496420e113871bc20646ccafb95769ab6abaa4f1&=",
      })
      .setColor(colors.Error);

    try {
      // Check if the target channel is not a voice channel
      if (targetChannel.type === "GUILD_VOICE") {
        return interaction.reply({
          embeds: [
            errorsEmbed.setDescription(" Voice channels cannot be locked."),
          ],
          ephemeral: true,
        });
      }

      // Check if the target channel is already locked
      if (
        targetChannel.permissionOverwrites.cache
          .get(targetChannel.guild.id)
          ?.deny.has(PermissionsBitField.Flags.SendMessages)
      ) {
        return interaction.reply({
          embeds: [
            errorsEmbed.setDescription("The channel is already locked."),
          ],
          ephemeral: true,
        });
      }

      // Lock the channel by denying send messages permission
      await targetChannel.permissionOverwrites.edit(targetChannel.guild.id, {
        SendMessages: false,
      });

      const successEmbed = new EmbedBuilder()
        .setColor(colors.Alert)
        .setDescription(
          `✅ Channel ${targetChannel} has been locked by ${member}.`
        );

      interaction.reply({ embeds: [successEmbed], ephemeral: true });
    } catch (error) {
      console.error("Error occurred while locking the channel:", error);
      interaction.reply({
        embeds: [
          errorsEmbed.setDescription(
            "Could not lock the channel due to an error."
          ),
        ],
      });
    }
  },
};
