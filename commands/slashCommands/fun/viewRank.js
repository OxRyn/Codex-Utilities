const {
  AttachmentBuilder,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} = require("discord.js");
const { Rank } = require("canvacord");
const User = require("../../../schemas/RankingSchema");
const ChannelDB = require("../../../schemas/RankingChannelSchema.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("🔎 Check the Level of a User or Your Own")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("👤 Which User's Level Do You Want to Check?")
        .setRequired(false)
    )
    .setDMPermission(false),

  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const { options, guild } = interaction;
    const member = options.getMember("user") || interaction.member;
    let channelDBS;
    let user;
    const guildId = member.guild.id;
    const userId = member.user.id;
    user = await User.findOne({ guildId, userId });

    if (!user) {
      user = {
        level: 1,
        xp: 0,
      };
    }

    channelDBS = await ChannelDB.findOne({ guild: guildId });

    const rank = new Rank()
      .setAvatar(member.user.displayAvatarURL())
      .setCurrentXP(user.xp)
      .setLevel(user.level)
      .setRank(0, 0, false)
      .setRequiredXP(user.level * 100)
      .setStatus("online")
      .setProgressBar("#75ff7e", "COLOR")
      .setUsername(member.user.username)
      .setBackground(
        "IMAGE",
        channelDBS?.image ||
          "https://wallpapertag.com/wallpaper/full/e/c/6/477550-most-popular-hubble-ultra-deep-field-wallpaper-1920x1200.jpg"
      );

    rank.build().then((data) => {
      interaction.reply({
        files: [new AttachmentBuilder(data, { name: "rank.png" })],
      });
    });
  },
};
