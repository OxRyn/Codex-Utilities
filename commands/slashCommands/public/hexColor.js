const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Color } = require("coloras");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hex")
    .setDescription("🌈 Generate / View a random hex color.")
    .addSubcommand((command) =>
      command
        .setName("randomcolor")
        .setDescription("🌈 Generate a random hex color."),
    )
    .addSubcommand((command) =>
      command
        .setName("viewhex")
        .setDescription("🔍 View a hex color.")
        .addStringOption((options) =>
          options
            .setName("hexcode")
            .setDescription("Provide the hex code you wannna view.")
            .setRequired(true),
        ),
    ),
  async execute(interaction) {
    const { options } = interaction;
    const sub = options.getSubcommand();
    switch (sub) {
      case "randomcolor":
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
          .setFooter({ text: "/hex randomcolor" })
          .setTimestamp();

        await interaction.reply({ embeds: [colorEmbed] });
        break;

      case "viewhex":
        const hexCode = interaction.options.getString("hexcode");

        // Regular expression to match a valid hexadecimal color code
        const hexPattern = /^#([0-9A-Fa-f]{3}){1,2}$/;

        if (hexPattern.test(hexCode)) {
          // The input is a valid hex code
          const formattedHex = hexCode.startsWith("#")
            ? hexCode
            : `#${hexCode}`;
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
                text: `/hex view`,
              })
              .setTimestamp();

            await interaction.reply({
              content: `**Note: ** ${interaction.user} \`#000000\` is a special hex code, it may appear black but its **none** color in terms of Discord.`,
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
                text: `/hex view`,
              })
              .setTimestamp();

            await interaction.reply({ embeds: [viewColorEmbed] });
          }
        } else {
          // The input is not a valid hex code
          await interaction.reply({
            content:
              "Invalid hex code. Please provide a valid hexadecimal color code.",
          });
        }
        break;
    }
  },
};
