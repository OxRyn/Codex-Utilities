const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ChannelType,
} = require("discord.js");
const database = require("../../../schemas/memberLog.js");
const colors = require("../../../utils/colors.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup_memberlog")
    .setDescription(
      "🔧Set up the logging system for your server with this command!"
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false)
    .addChannelOption((options) =>
      options
        .setName("log_channel")
        .setDescription("⚙️Select a channel for the bot to work in!⚙️")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addRoleOption((options) =>
      options
        .setName("member_role")
        .setDescription(
          "🔧Which role should be assigned to the new members automatically?🔧"
        )
    )
    .addRoleOption((options) =>
      options
        .setName("bot_role")
        .setDescription(
          "🤖Which role should be assigned to the new bots automatically?🤖"
        )
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    const { guild, options } = interaction;
    const logChannel = options.getChannel("log_channel").id;

    let memberRole = options.getRole("member_role")
      ? options.getRole("member_role").id
      : null;

    let botRole = options.getRole("bot_role")
      ? options.getRole("bot_role").id
      : null;

    await database.findOneAndUpdate(
      { Guild: guild.id },
      {
        logChannel: logChannel,
        memberRole: memberRole,
        botRole: botRole,
      },
      { new: true, upsert: true }
    );

    client.guildConfig.set(guild.id, {
      logChannel: logChannel,
      memberRole: memberRole,
      botRole: botRole,
    });

    const Embed = new EmbedBuilder()
      .setColor(colors.Success)
      .setDescription(
        [
          `- 📖Logging Channel Updated: <#${logChannel}>`,
          `- 🙋‍♀️Member Auto-Role Updated: ${
            memberRole ? `<@&${memberRole}` : "None"
          }>`,
          `- 🤖 Bot Auto-Role Updated: ${botRole ? `<@&${botRole}` : "None"}>`,
        ].join("\n")
      );
    return interaction.editReply({ embeds: [Embed] });
  },
};
