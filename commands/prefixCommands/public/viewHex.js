const { EmbedBuilder } = require("discord.js");
const { Color } = require("coloras");

module.exports = {
  name: "viewhex",
  aliases: ["vhex"],
  description: "Generate a random hex color code.",
  run: async (client, message, args) => {
    let hexCode = args[0];

    // Regular expression to match a valid hexadecimal color code
    const hexPattern = /^#([0-9A-Fa-f]{3}){1,2}$/;

    if (hexPattern.test(hexCode)) {
      // The input is a valid hex code
      const formattedHex = hexCode.startsWith("#") ? hexCode : `#${hexCode}`;
      const hexColor = formattedHex;

      const color2 = new Color(`${hexColor}`);
      const hex2 = hexColor;
      const r2 = parseInt(hex2.slice(1, 3), 16);
      const g2 = parseInt(hex2.slice(3, 5), 16);
      const b2 = parseInt(hex2.slice(5, 7), 16);

      if (formattedHex === "#000000") {
        // Create and send an embed for valid color
        const viewColorEmbed = new EmbedBuilder()
          .setColor(formattedHex)
          .setThumbnail(`${color2.imageUrl}`)
          .addFields(
            {
              name: "Hex Code",
              value: hex2,
              inline: false,
            },
            {
              name: "RGB Code",
              value: `RGB(${r2}, ${g2}, ${b2})`,
              inline: false,
            },
          )
          .setFooter({
            text: `${process.env.PREFIX}viewhex | Requested by ${message.author.username}`,
          })
          .setTimestamp();

        await message.reply({
          content: `**Note: ** ${message.author} \`#000000\` is a special hex code, it may appear black but its **none** color in terms of Discord.`,
          embeds: [viewColorEmbed],
        });
      } else {
        // Create and send an embed for valid color
        const viewColorEmbed = new EmbedBuilder()
          .setColor(formattedHex)
          .setThumbnail(`${color2.imageUrl}`)
          .addFields(
            {
              name: "Hex Code",
              value: hex2,
              inline: false,
            },
            {
              name: "RGB Code",
              value: `RGB(${r2}, ${g2}, ${b2})`,
              inline: false,
            },
          )
          .setFooter({
            text: `${process.env.PREFIX}viewhex | Requested by ${message.author.username}`,
          })
          .setTimestamp();

        await message.reply({ embeds: [viewColorEmbed] });
      }
    } else {
      // The input is not a valid hex code
      await message.reply({
        content:
          "Invalid hex code. Please provide a valid hexadecimal color code.",
      });
    }
  },
};
