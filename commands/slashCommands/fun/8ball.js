const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const colors = require("../../../utils/colors.js");
const { EightballCount } = require("../../../schemas/fun.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("8ball")
    .setDescription("🎱 Ask the Magic 8-Ball a yes-or-no question")
    .addStringOption((options) =>
      options
        .setName("question")
        .setDescription("What's your yes-or-no question?")
        .setRequired(true)
    )
    .setDMPermission(false),

  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const memberId = interaction.user.id;
    const guildId = interaction.guild.id;

    let funRecord = await EightballCount.findOne({
      Guild: guildId,
      MemberId: memberId,
    });
    if (!funRecord) {
      funRecord = new EightballCount({
        Guild: guildId,
        MemberId: memberId,
        EightballCount: 0,
      });
    }

    funRecord.EightballCount += 1;
    await funRecord.save();

    const eightBallResponses = [
      "🎱 | It is certain",
      "🎱 | It is decidedly so",
      "🎱 | Without a doubt",
      "🎱 | Yes definitely",
      "🎱 | You may rely on it",
      "🎱 | As I see it, yes",
      "🎱 | Most likely",
      "🎱 | Outlook good",
      "🎱 | Yes",
      "🎱 | Signs point to yes",
      "🎱 | Reply hazy, try again",
      "🎱 | Ask again later",
      "🎱 | Better not tell you now",
      "🎱 | Cannot predict now",
      "🎱 | Concentrate and ask again",
      "🎱 | Don't count on it",
      "🎱 | My reply is no",
      "🎱 | My sources say no",
      "🎱 | Outlook not so good",
      "🎱 | Very doubtful",
    ];

    const question = interaction.options.getString("question");
    const randomResponse =
      eightBallResponses[Math.floor(Math.random() * eightBallResponses.length)];

    const embed = new EmbedBuilder()
      .setColor(colors.Information)
      .setAuthor({
        name: `🎱 ${interaction.user.username} has used /8ball ${funRecord.EightballCount} times`,
        iconURL: `${interaction.user.displayAvatarURL({ size: 256 })}`,
      })
      .setTitle("🎱 | Magic 8-Ball")
      .setDescription(`**${interaction.user.username} asked:**\n"${question}"`)
      .addFields({ name: "**🎱 Answer**", value: randomResponse })
      .setThumbnail(
        "https://media.discordapp.net/attachments/1147489563648983060/1157703552504959026/8-ball.png?ex=651992f4&is=65184174&hm=07651ae32bd02ba8f53aa8b2e764a3298b3fab361a5795de8ea9172f37466772&="
      )
      .setTimestamp()
      .setFooter({
        text: `/8ball | Requested by ${interaction.user.username}`,
      });

    interaction.reply({ embeds: [embed] });
  },
};
