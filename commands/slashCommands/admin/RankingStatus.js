const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
} = require("discord.js");
const ChannelDB = require("../../../schemas/RankingChannelSchema.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ranking-status")
    .setDescription(
      "🛠 Configure whether to enable or disable the leveling system."
    )
    .addStringOption((option) =>
      option
        .setName("turn")
        .setDescription("⚙️ Choose an option.")
        .setRequired(true)
        .addChoices({ name: "on", value: "on" }, { name: "off", value: "off" })
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
    const status = interaction.options.getString("turn");
    const channelDB3 = await ChannelDB.findOne({ guild: guild.id });

    if (status === "on") {
      channelDB3.status = true;
    } else if (status === "off") {
      channelDB3.status = false;
    }

    await channelDB3.save(); //Save new changes in database

    const statusText = channelDB3.status ? "on" : "off";

    const embed = new EmbedBuilder()
      .setTitle("💠 System Configuration Complete")
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setColor("Random")
      .setFields(
        { name: "Moderator:", value: `${interaction.user.username}` },
        {
          name: "The leveling system has been configured as:",
          value: `Leveling: ${statusText}`,
        }
      )
      .setTimestamp();

    interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
