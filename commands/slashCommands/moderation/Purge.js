const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const colors = require("../../../utils/colors.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("🗑️ Clear a specified number of messages.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false)
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("🔢 The number of messages to clear.")
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("📌 The channel from which to clear messages.")
    )
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("👤 The user whose messages to clear.")
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { options, channel, guild } = interaction;
    const amount = options.getInteger("amount");
    const targetChannel = options.getChannel("channel") || channel;
    const targetUser = options.getMember("user");

    const errorsEmbed = new EmbedBuilder()
      .setAuthor({
        name: "Could not purge messages due to",
        iconURL:
          "https://media.discordapp.net/attachments/1147489563648983060/1156561255138611281/amnaError1.png?ex=65156b1b&is=6514199b&hm=4723faa01a55c017f652fd75496420e113871bc20646ccafb95769ab6abaa4f1&=",
      })
      .setColor(colors.Error);

    try {
      // Check if the amount is within a valid range (1 to 100 messages)
      if (amount < 1 || amount > 100) {
        return interaction.reply({
          embeds: [
            errorsEmbed.setDescription(
              "You can only clear between 1 and 100 messages at a time."
            ),
          ],
          ephemeral: true,
        });
      }

      // Determine the target messages based on options
      let messagesToDelete;

      if (targetUser) {
        // If a target user is specified, fetch all messages by that user in the target channel
        messagesToDelete = await targetChannel.messages.fetch({
          limit: 100, // Fetch up to 100 messages at a time (maximum)
        });

        messagesToDelete = messagesToDelete.filter(
          (msg) => msg.author.id === targetUser.id
        );

        // Calculate how many messages to delete
        const messagesToDeleteCount = Math.min(amount, messagesToDelete.size);

        // Get the messages to delete
        messagesToDelete = messagesToDelete.first(messagesToDeleteCount);
      } else {
        // If no target user is specified, fetch the last 'amount' messages in the target channel
        messagesToDelete = await targetChannel.messages.fetch({
          limit: amount,
        });
      }

      // Check if there are enough messages to delete
      if (messagesToDelete.size === 0) {
        return interaction.reply({
          embeds: [
            errorsEmbed.setDescription(
              `There are no messages to clear${
                targetUser ? ` from ${targetUser}` : ""
              } in ${targetChannel}.`
            ),
          ],
          ephemeral: true,
        });
      }

      // Delete the fetched messages
      await targetChannel.bulkDelete(messagesToDelete);

      const successEmbed = new EmbedBuilder()
        .setColor(colors.Success)
        .setDescription(
          `Cleared ${messagesToDelete.size} messages${
            targetUser ? ` from ${targetUser}` : ""
          } in ${targetChannel}.`
        );

      interaction.reply({ embeds: [successEmbed], ephemeral: true });
    } catch (error) {
      interaction.reply({
        embeds: [
          errorsEmbed.setDescription(
            `Could not clear messages due to an error.\n${error}`
          ),
        ],
      });
    }
  },
};
