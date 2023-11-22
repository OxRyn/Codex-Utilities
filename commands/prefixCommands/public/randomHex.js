const { EmbedBuilder } = require("discord.js");
const { Color } = require("coloras");

module.exports = {
  name: "randomcolor",
  aliases: ["hex"],
  description: "Generate a random hex color code.",
  run: async (client, message, args) => {
    function getRandomHexColor() {
      const letters = "0123456789ABCDEF";
      let color = "#";

      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }

      return color;
    }

    const randomColor = getRandomHexColor();

    const hex = randomColor;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    const color = new Color(`${randomColor}`);

    const colorEmbed = new EmbedBuilder()
      .setColor(randomColor)
      .addFields(
        {
          name: "Hex Code",
          value: randomColor,
          inline: false,
        },
        {
          name: "RGB Code",
          value: `RGB(${r}, ${g}, ${b})`,
          inline: false,
        },
      )
      .setThumbnail(`${color.imageUrl}`)
      .setFooter({
        text: `${process.env.PREFIX}hex | Requested by ${message.author.username}`,
      })
      .setTimestamp();

    await message.reply({ embeds: [colorEmbed] });
  },
};
