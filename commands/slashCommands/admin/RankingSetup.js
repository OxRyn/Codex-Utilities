const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  ChannelType,
} = require("discord.js");
const ChannelDB = require("../../../schemas/RankingChannelSchema.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup-ranking-system")
    .setDescription("🛠 Start configuring our ranking system.")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("🗒 Where should I send the level up notifications?")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("image")
        .setDescription("🖼 Add your custom image as the background")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const { options, guild } = interaction;
    const channel = options.getChannel("channel");
    const image = options.getString("image");

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild))
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("⭕️ We Have a Problem.")
            .setColor("Red")
            .setDescription(
              `It seems you don't have the necessary permissions: ${PermissionFlagsBits.ManageGuild} Contact an Administrator for assistance.`
            )
            .setThumbnail(guild.iconURL({ dynamic: true })),
        ],
      });

    const channelDB = await ChannelDB.findOne({ guild: guild.id });

    if (channelDB) {
      const Exist = new EmbedBuilder()
        .setTitle("⭕️ We Have a Problem.")
        .setColor("Red")
        .setFields(
          {
            name: "💠 The channel has already been previously configured.",
            value: `It is located in: <#${channelDB.channel}>`,
          },
          {
            name: "💠 If you want to change it, you will have to delete it and reconfigure it using:",
            value: "`/ranking delete`",
          }
        );
      return interaction.reply({
        embeds: [Exist],
        ephemeral: true,
      });
    }

    const completedEmbed = new EmbedBuilder()
      .setColor("Green")
      .setImage(
        `${image}` ||
          "https://wallpapertag.com/wallpaper/full/e/c/6/477550-most-popular-hubble-ultra-deep-field-wallpaper-1920x1200.jpg"
      )
      .setFields(
        {
          name: "💠 Ranking Announcement Channel Successfully Configured",
          value: `Moderator: <@${interaction.member.id}>`,
        },
        {
          name: "Configured Channel:",
          value: `<#${channel.id}>`,
          inline: true,
        },
        {
          name: "If you added a background image",
          value:
            "You will see it in this embed, or you will see the default image.",
        }
      )
      .setTimestamp();

    interaction.reply({
      embeds: [completedEmbed],
    });

    const newChannelDB = new ChannelDB({
      guild: guild.id,
      channel: channel.id,
      image: `${image}` || "default-image-url",
    });

    const savedChannelDB = await newChannelDB.save();

    if (!savedChannelDB) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("⭕️ We Have a Problem.")
            .setColor("Red")
            .setDescription(
              `It seems I couldn't save the channel correctly. The developer has been notified. Please try again in the next 10 minutes.`
            )
            .setThumbnail(guild.iconURL({ dynamic: true })),
        ],
      });
    }
  },
};
