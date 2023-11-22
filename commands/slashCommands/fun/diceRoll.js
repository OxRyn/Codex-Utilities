const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  Client,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const colors = require("../../../utils/colors.js");
const { Dice } = require("../../../schemas/fun.js");

function setDiceThumbnail(embed, diceRoll) {
  const diceImages = [
    "",
    "https://media.discordapp.net/attachments/1147489563648983060/1157354105870749756/amnaDice1.png?ex=65184d81&is=6516fc01&hm=11883f7fbea082453d2d98bb50a669f6ff28582e8bb99d6d4b2401a41e51ee4a&=&width=676&height=676",
    "https://media.discordapp.net/attachments/1147489563648983060/1157354106101432401/amnaDice2.png?ex=65184d81&is=6516fc01&hm=93a9d833610915c615dfa16ddf744673bb5e3454f9e344c556a0c2648f2016de&=&width=676&height=676",
    "https://media.discordapp.net/attachments/1147489563648983060/1157354106386661386/amnaDice3.png?ex=65184d81&is=6516fc01&hm=bd1aeb20eb9308ddd8b2fee77c321fe199d15a989b8c226f3193af7451db3a23&=&width=676&height=676",
    "https://media.discordapp.net/attachments/1147489563648983060/1157354106722193418/amnaDice4.png?ex=65184d81&is=6516fc01&hm=0c8f1354bb549433498c3a4fbc4d8e0cb1eeef8dcf33fb2705b571b6a94df184&=&width=676&height=676",
    "https://media.discordapp.net/attachments/1147489563648983060/1157354106965459075/amnaDice5.png?ex=65184d81&is=6516fc01&hm=898f5e5d28a627fa685a97830e2d1c681498398e80932b7599978d11a043ebab&=&width=676&height=676",
    "https://media.discordapp.net/attachments/1147489563648983060/1157354107271659570/amnaDice6.png?ex=65184d81&is=6516fc01&hm=98a6bd02099250b49d6283e2b7ac3fe77a314291f8ce94932e7e244e4900e90b&=&width=676&height=676",
  ];

  if (diceRoll >= 1 && diceRoll <= 6) {
    embed.setThumbnail(diceImages[diceRoll]);
  } else {
    embed.setThumbnail(
      "https://media.discordapp.net/attachments/1147489563648983060/1157354604485427230/dice.png?ex=65184df8&is=6516fc78&hm=dbbe3eb13855f4f1ee26429927f610cb30f6729a5a769ce342d0a6e4792c44ed&="
    );
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dice")
    .setDescription("🎲 Roll a dice.")
    .setDMPermission(false),

  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */

  async execute(interaction, client) {
    const memberId = interaction.user.id;
    const guildId = interaction.guild.id;

    let funRecord = await Dice.findOne({
      Guild: guildId,
      MemberId: memberId,
    });
    if (!funRecord) {
      funRecord = new Dice({
        Guild: guildId,
        MemberId: memberId,
        DiceRollCount: 0,
      });
    }

    funRecord.DiceRollCount += 1;
    await funRecord.save();

    const initialEmbed = new EmbedBuilder()
      .setColor(colors.Timeout)
      .setAuthor({
        name: `${interaction.user.username} has rolled the dice ${funRecord.DiceRollCount} times`,
        iconURL: `${interaction.user.displayAvatarURL({ size: 256 })}`,
      })
      .setTitle("🎲 Dice Roll")
      .setDescription(
        `**${interaction.user.username}** rolled a dice and got ...`
      )
      .setThumbnail(
        "https://media.discordapp.net/attachments/1147489563648983060/1157354604485427230/dice.png?ex=65184df8&is=6516fc78&hm=dbbe3eb13855f4f1ee26429927f610cb30f6729a5a769ce342d0a6e4792c44ed&="
      )
      .setTimestamp()
      .setFooter({
        text: `/dice | Requested by ${interaction.user.username}`,
      });

    const message = await interaction.reply({ embeds: [initialEmbed] });

    setTimeout(async () => {
      const diceRoll = Math.floor(Math.random() * 6) + 1;

      const finalEmbed = new EmbedBuilder()
        .setColor(colors.Timeout)
        .setAuthor({
          name: `${interaction.user.username} has rolled the dice ${funRecord.DiceRollCount} times`,
          iconURL: `${interaction.user.displayAvatarURL({ size: 256 })}`,
        })
        .setTitle("🎲 Dice Roll")
        .setDescription(
          `**${interaction.user.username}** rolled a dice and got **${diceRoll}**`
        )
        .setThumbnail(
          "https://media.discordapp.net/attachments/1147489563648983060/1157354604485427230/dice.png?ex=65184df8&is=6516fc78&hm=dbbe3eb13855f4f1ee26429927f610cb30f6729a5a769ce342d0a6e4792c44ed&="
        )
        .setTimestamp()
        .setFooter({
          text: `/dice | Requested by ${interaction.user.username}`,
        });

      setDiceThumbnail(finalEmbed, diceRoll);

      message.edit({ embeds: [finalEmbed] });
    }, 3000);
  },
};
