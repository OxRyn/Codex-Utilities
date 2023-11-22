const { ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const colors = require("../../../utils/colors.js");
const categoryEmojis = {
  admin: "<:amnaStaff1:1156174811094061066>",
  moderation: "<:amnaModeration1:1156175433985949707>",
  music: "<:amnaMusic1:1156175438880706631>",
  utilities: "<:amnaSlashCommand1:1156175443431526500>",
  fun: "<:amnaGameConntroler1:1157344420765642862>",
};
module.exports = {
  name: "help",
  description: "📚 Select a category to get information",
  aliases: ["h", "Help", "HELP"],
  run: async (client, message, interaction) => {
    const categories = [];

    // Read command data from files and categorize them
    const commandsDir = path.join(__dirname, "..", "../prefixCommands");
    const categoryDirs = fs.readdirSync(commandsDir, { withFileTypes: true });

    for (const categoryDir of categoryDirs) {
      if (categoryDir.isDirectory()) {
        const categoryName = categoryDir.name;

        if (categoryName.toLowerCase() === "developer") {
          continue;
        }
        const categoryCommands = [];

        const categoryFiles = fs.readdirSync(
          path.join(commandsDir, categoryName)
        );
        for (const categoryFile of categoryFiles) {
          if (categoryFile.endsWith(".js")) {
            const command = require(path.join(
              commandsDir,
              categoryName,
              categoryFile
            ));
            categoryCommands.push(command);
          }
        }

        categories.push({ name: categoryName, commands: categoryCommands });
      }
    }

    // Create buttons for categories
    const row = new ActionRowBuilder().addComponents(
      categories.map((category, index) =>
        new ButtonBuilder()
          .setCustomId(`button${index + 1}`)
          .setLabel(
            category.name.charAt(0).toUpperCase() + category.name.slice(1)
          )
          .setEmoji(categoryEmojis[category.name.toLowerCase()])
          .setStyle(2)
      )
    );

    const initialEmbed = new EmbedBuilder()
      .setTitle("Help Menu - Home")
      .setAuthor({
        name: client.user.tag,
        iconURL: client.user.displayAvatarURL({ size: 256 }),
      })
      .setDescription(
        `Select a category via the menu below to view the commands available. 📢

If you require assistance or are experiencing a persistent bug, please create a bug report using </report bug:1156930241328070737> bugreport or by joining the **[Support Discord Server](https://discord.gg/6jTrKuNxWg)**. 🆘`
      )
      .setFooter({ text: `/help | Requested by ${message.author.username}` })
      .setFields(
        {
          name: "`Administration 👑`",
          value: `<:amnaSubInlineText2:1157348392599564338> Comprehensive set of commands for server administrators.`,
          inline: true,
        },
        {
          name: "`Fun 🎉`",
          value:
            "<:amnaSubInlineText2:1157348392599564338> Exciting and entertaining commands to add fun and amusement to your server.",
          inline: true,
        },
        {
          name: "`Moderation 🛡️`",
          value: `<:amnaSubInlineText2:1157348392599564338> Tools and commands for effective server moderation.`,
          inline: true,
        },
        {
          name: "`Music 🎶`",
          value: `<:amnaSubInlineText2:1157348392599564338> Enjoy music with a variety of music-related commands.`,
          inline: true,
        },
        {
          name: "`Utilities 🛠️`",
          value: `<:amnaSubInlineText2:1157348392599564338> Handy utility commands for various tasks and information.`,
          inline: true,
        },
        {
          name: "‎",
          value: "‎",
          inline: true,
        }
      )
      .setTimestamp()
      .setColor(colors.Default);

    const message1 = await message.reply({
      embeds: [initialEmbed],
      components: [row],
    });

    // Set up collectors for category buttons
    const buttonCollectors = [];

    categories.forEach((category, index) => {
      const filter = (i) =>
        i.customId === `button${index + 1}` && i.user.id === message.author.id;

      const collector = message1.createMessageComponentCollector({ filter });

      collector.on("collect", (i) => {
        const categoryData = categories[index];

        const categoryEmbed = new EmbedBuilder()
          .setTitle(`Help Menu - ${categoryData.name} Commands`)
          .setAuthor({
            name: client.user.tag,
            iconURL: client.user.displayAvatarURL({ size: 256 }),
          })
          .setDescription(
            `Select a category via the menu below to view the commands available. 📢

If you require assistance or are experiencing a persistent bug, please create a bug report using </report bug:1156930241328070737> bugreport or by joining the **[Support Discord Server](https://discord.gg/6jTrKuNxWg)**. 🆘`
          )
          .setFooter({
            text: `/help | Requested by ${message.author.username}`,
          })
          .setTimestamp()
          .setColor(colors.Default);

        categoryData.commands.forEach((command) => {
          categoryEmbed.addFields({
            name: `\`!${command.name}\``,
            value: `${command.description}`,
            inline: true,
          });
        });

        // Update the message with the category-specific embed
        i.update({ embeds: [categoryEmbed] });
      });

      buttonCollectors.push(collector);
    });
  },
};
