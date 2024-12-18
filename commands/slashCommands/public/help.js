const { SlashCommandBuilder } = require("@discordjs/builders");
const { ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const colors = require("../../../utils/colors.js");
const { Emoji } = require("../../../utils/emojis.js");
const categoryEmojis = {
  admin: `${Emoji.Staff1}`,
  moderation: `${Emoji.Moderation1}`,
  music: `${Emoji.Music1}`,
  public: `${Emoji.SlashCommand1}`,
  fun: `${Emoji.GameConntroler1}`,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("📚 Select a category to get information"),
  async execute(interaction, client) {
    const categories = [];

    // Read command data from files and categorize them
    const commandsDir = path.join(__dirname, "..", "../slashCommands");
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
    const categoryRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("homeButton")
        .setLabel("Home")
        .setEmoji(Emoji.Home1)
        .setStyle(2)
    );

    // Add "Home" button to the categoryRow
    categoryRow.addComponents(
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
        name: interaction.client.user.tag,
        iconURL: interaction.client.user.displayAvatarURL({ size: 256 }),
      })
      .setDescription(
        `Select a category via the menu below to view the commands available. 📢

If you require assistance or are experiencing a persistent bug, please create a bug report using </report bug:1156930241328070737> bugreport or by joining the **[Support Discord Server](https://discord.gg/6jTrKuNxWg)**. 🆘`
      )
      .setFooter({ text: `/help | Requested by ${interaction.user.username}` })
      .setFields(
        {
          name: `\`Administration 👑\``,
          value: `${Emoji.SubInlineText2} Comprehensive set of commands for server administrators.`,
          inline: true,
        },
        {
          name: `\`Fun 🎉\``,
          value: `${Emoji.SubInlineText2} Exciting and entertaining commands to add fun and amusement to your server.`,
          inline: true,
        },
        {
          name: `\`Moderation 🛡️\``,
          value: `${Emoji.SubInlineText2} Tools and commands for effective server moderation.`,
          inline: true,
        },
        {
          name: `\`Utilities 🛠️\``,
          value: `${Emoji.SubInlineText2} Handy utility commands for various tasks and information.`,
          inline: true,
        },
        {
          name: `‎`,
          value: `‎`,
          inline: true,
        },
        {
          name: `‎ `,
          value: `‎`,
          inline: true,
        }
      )
      .setTimestamp()
      .setColor(colors.Default);

    const message = await interaction.reply({
      embeds: [initialEmbed],
      components: [categoryRow],
    });

    // Set up collectors for category and fixed buttons
    const buttonCollectors = [];

    // Collector for category buttons
    categories.forEach((category, index) => {
      const filter = (i) =>
        i.customId === `button${index + 1}` &&
        i.user.id === interaction.user.id;

      const collector = message.createMessageComponentCollector({ filter });

      collector.on("collect", async (i) => {
        const categoryData = categories[index];

        if (i.user.id !== interaction.user.id) {
          // Send a warning message to the unauthorized user
          try {
            await i.reply({
              content: "⚠️ This is not your interaction.",
              ephemeral: true,
            });
          } catch (error) {
            console.error("Error handling unauthorized interaction:", error);
          }
          return;
        }

        const categoryEmbed = new EmbedBuilder()
          .setTitle(`Help Menu - ${categoryData.name} Commands`)
          .setAuthor({
            name: interaction.client.user.tag,
            iconURL: interaction.client.user.displayAvatarURL({ size: 256 }),
          })
          .setDescription(
            `Select a category via the menu below to view the commands available. 📢

If you require assistance or are experiencing a persistent bug, please create a bug report using </report bug:1156930241328070737> bugreport or by joining the **[Support Discord Server](https://discord.gg/6jTrKuNxWg)**. 🆘`
          )
          .setFooter({
            text: `/help | Requested by ${interaction.user.username}`,
          })
          .setTimestamp()
          .setColor(colors.Default);

        categoryData.commands.forEach((command) => {
          categoryEmbed.addFields({
            name: `\`/${command.data.name}\``,
            value: `${command.data.description}`,
            inline: true,
          });
        });

        // Update the message with the category-specific embed
        i.update({ embeds: [categoryEmbed] });
      });

      buttonCollectors.push(collector);
    });

    // Collector for "Home" button
    const homeFilter = (i) =>
      i.customId === "homeButton" && i.user.id === interaction.user.id;
    const homeCollector = message.createMessageComponentCollector({
      filter: homeFilter,
    });

    homeCollector.on("collect", async (i) => {
      // Handle the "Home" button click
      // Update the message with the initial embed
      i.update({ embeds: [initialEmbed] });
    });

    buttonCollectors.push(homeCollector);

    // Add a collector to disable all buttons when any collector ends
    buttonCollectors.forEach((collector) => {
      collector.on("end", () => {
        // Disable all buttons in the categoryRow
        categoryRow.components.forEach((button) => {
          button.setDisabled(true);
        });

        // Update the message with the disabled buttons
        message.edit({ components: [categoryRow] });
      });
    });
  },
};
