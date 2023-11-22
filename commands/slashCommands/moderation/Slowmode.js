const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const ms = require("ms");
const colors = require("../../../utils/colors.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("slowmode")
    .setDescription("🕰️ Enable or disable slow mode in a channel.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false)
    .addStringOption((option) =>
      option
        .setName("state")
        .setDescription("🟢 Enable or disable slow mode.")
        .setRequired(true)
        .addChoices(
          { name: `🟢 Enable`, value: `on` },
          { name: `🔴 Disable`, value: `off` }
        )
    )
    .addStringOption((option) =>
      option
        .setName("duration")
        .setDescription("⏳ The duration of slow mode (e.g., 1m, 10s).")
        .setRequired(false)
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("📢 Optional: Tag a channel to enable slow mode in.")
        .setRequired(false)
    ),
  async execute(interaction) {
    const state = interaction.options.getString("state");

    let channel;
    const channelOption = interaction.options.getChannel("channel");

    if (channelOption) {
      channel = interaction.guild.channels.cache.get(channelOption.id);
      if (!channel) {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: "Could not enable slowmode due to",
            iconURL:
              "https://media.discordapp.net/attachments/1147489563648983060/1156561255138611281/amnaError1.png?ex=65156b1b&is=6514199b&hm=4723faa01a55c017f652fd75496420e113871bc20646ccafb95769ab6abaa4f1&=",
          })
          .setColor(colors.Error)
          .setDescription(
            "Invalid channel. Please tag a valid channel in your server."
          );
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }
    } else {
      channel = interaction.channel;
    }

    // Check the "state" option to determine whether to enable or disable slow mode.
    if (state === "on") {
      const duration = interaction.options.getString("duration");

      if (!duration) {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: "Could not enable slowmode due to",
            iconURL:
              "https://media.discordapp.net/attachments/1147489563648983060/1156561255138611281/amnaError1.png?ex=65156b1b&is=6514199b&hm=4723faa01a55c017f652fd75496420e113871bc20646ccafb95769ab6abaa4f1&=",
          })
          .setColor(colors.Error)
          .setDescription("Please provide a duration when enabling slow mode.");
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      const durationMilliseconds = ms(duration);
      if (!durationMilliseconds) {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: "Could not enable slowmode due to",
            iconURL:
              "https://media.discordapp.net/attachments/1147489563648983060/1156561255138611281/amnaError1.png?ex=65156b1b&is=6514199b&hm=4723faa01a55c017f652fd75496420e113871bc20646ccafb95769ab6abaa4f1&=",
          })
          .setColor(colors.Error)
          .setDescription(
            "Invalid duration format. Please use a valid format like 1m, 10s."
          );
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      // Enable slow mode in the specified channel with the given duration.
      try {
        await channel.setRateLimitPerUser(durationMilliseconds / 1000);

        // Create an embed for the success message.
        const embed = new EmbedBuilder()
          .setColor(colors.Success)
          .setTitle("✅ Slow Mode Enabled")
          .setDescription(
            `Slow mode has been enabled in ${channel} for ${duration}.`
          );

        return interaction.reply({ embeds: [embed], ephemeral: true });
      } catch (error) {
        console.error("Error enabling slow mode:", error);
        const embed = new EmbedBuilder()
          .setAuthor({
            name: "Could not enable slowmode due to",
            iconURL:
              "https://media.discordapp.net/attachments/1147489563648983060/1156561255138611281/amnaError1.png?ex=65156b1b&is=6514199b&hm=4723faa01a55c017f652fd75496420e113871bc20646ccafb95769ab6abaa4f1&=",
          })
          .setColor(colors.Error)
          .setDescription("An error occurred while enabling slow mode.");
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }
    } else if (state === "off") {
      // Check if slow mode is already disabled in the channel.
      if (channel.rateLimitPerUser === 0) {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: "Could not disable slowmode due to",
            iconURL:
              "https://media.discordapp.net/attachments/1147489563648983060/1156561255138611281/amnaError1.png?ex=65156b1b&is=6514199b&hm=4723faa01a55c017f652fd75496420e113871bc20646ccafb95769ab6abaa4f1&=",
          })
          .setColor(colors.Error)
          .setDescription("Slow mode is already disabled in this channel.");
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      // Disable slow mode in the specified channel or the current channel.
      try {
        await channel.setRateLimitPerUser(0);

        // Create an embed for the success message.
        const embed = new EmbedBuilder()
          .setColor(colors.Success)
          .setTitle("✅ Slow Mode Disabled")
          .setDescription(`Slow mode has been disabled in ${channel}.`);

        return interaction.reply({ embeds: [embed], ephemeral: true });
      } catch (error) {
        console.error("Error disabling slow mode:", error);
        const embed = new EmbedBuilder()
          .setAuthor({
            name: "Could not disable slowmode due to",
            iconURL:
              "https://media.discordapp.net/attachments/1147489563648983060/1156561255138611281/amnaError1.png?ex=65156b1b&is=6514199b&hm=4723faa01a55c017f652fd75496420e113871bc20646ccafb95769ab6abaa4f1&=",
          })
          .setColor(colors.Error)
          .setDescription("An error occurred while disabling slow mode.");
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }
    }
  },
};
