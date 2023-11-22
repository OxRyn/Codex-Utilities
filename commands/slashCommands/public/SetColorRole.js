const {
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  EmbedBuilder,
} = require("discord.js");
const { Color } = require("coloras");

const cooldowns = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setcolor")
    .setDescription("🎨 Set the color of your role.")
    .addStringOption((option) =>
      option
        .setName("hexcode")
        .setDescription("Enter the hex code for your role color.")
        .setRequired(true),
    ),
  async execute(interaction) {
    const hexCode = interaction.options.getString("hexcode");

    // Check if the hex code starts with #
    const validHexCode = hexCode.startsWith("#") ? hexCode : `#${hexCode}`;

    // Check if the hex code is valid
    const colorRegex = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/i;
    if (!colorRegex.test(validHexCode) || validHexCode === "#000000") {
      return interaction.reply({
        content: "❌ The provided hex code is not valid.",
        ephemeral: true,
      });
    }

    const color = new Color(`${validHexCode}`);

    // Check if the user is on cooldown
    const userId = interaction.user.id;
    if (cooldowns.has(userId)) {
      const cooldownExpiration = cooldowns.get(userId);
      let timeLeft = Math.max(
        0,
        Math.ceil((cooldownExpiration - Date.now()) / 1000),
      );

      if (timeLeft > 0) {
        const cooldownMessage = await interaction.reply({
          content: `⏳ You can use this command again in ${timeLeft} seconds.`,
          ephemeral: true,
        });

        // Start a countdown to delete the cooldown message
        const countdownInterval = setInterval(() => {
          if (timeLeft === 0) {
            clearInterval(countdownInterval);
            cooldownMessage.delete();
          } else {
            cooldownMessage.edit({
              content: `⏳ You can use this command again in ${timeLeft} seconds.`,
              ephemeral: true,
            });
          }
          timeLeft--;
        }, 1000);
        return;
      }
    }

    // Set a cooldown of 15 seconds (adjust as needed)
    const cooldownDuration = 15000; // 15 seconds in milliseconds
    cooldowns.set(userId, Date.now() + cooldownDuration);

    // Create the Confirm and Cancel buttons
    const confirmButton = new ButtonBuilder()
      .setCustomId("confirm")
      .setLabel("Confirm")
      .setStyle(ButtonStyle.Secondary);

    const cancelButton = new ButtonBuilder()
      .setCustomId("cancel")
      .setLabel("Cancel")
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(
      confirmButton,
      cancelButton,
    );

    // Create and send the initial embed
    const initialEmbed = new EmbedBuilder()
      .setTitle("Set Role Color")
      .setDescription(
        `🎨 Please confirm to set your role color with the provided hex code.\n**Hex Code:** \`${validHexCode}\``,
      )
      .setThumbnail(`${color.imageUrl}`)
      .setColor(validHexCode)
      .setTimestamp();
    const initialMessage = await interaction.reply({
      embeds: [initialEmbed],
      components: [row],
    });

    // Create a filter to listen for button interactions
    const filter = (i) => i.customId === "confirm" || i.customId === "cancel";
    const collector = initialMessage.createMessageComponentCollector({
      filter,
      time: 60000,
    });

    collector.on("collect", async (i) => {
      // Check if the user who pressed the button is not the author of the command
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

      if (i.customId === "cancel") {
        // If the user presses Cancel, remove the buttons and send a cancellation message
        await i.deferUpdate(); // Ensure the interaction is acknowledged
        await i.editReply({
          embeds: [
            initialEmbed.setDescription(
              "🚫 Set color operation has been canceled.\n**Hex Code:** " +
                validHexCode,
            ),
          ],
          components: [],
        });
      } else if (i.customId === "confirm") {
        // Include your role creation logic for the authorized user here
        // For example:
        try {
          // Try to update the interaction (button), but catch and handle any errors
          await i.deferUpdate(); // Ensure the interaction is acknowledged
          await i.editReply({
            embeds: [
              initialEmbed.setDescription(
                "⌛ Please wait...\n**Hex Code:** " + validHexCode,
              ),
            ],
            components: [],
          });

          // Your role creation logic here
          // Check if the user already has a custom color role
          let role = interaction.guild.roles.cache.find(
            (r) => r.name === `|${interaction.user.id}|`,
          );

          if (role) {
            // Delete the existing role if it exists
            await role.delete();
          }

          // Create a new role with the user's ID and the provided hex code
          role = await interaction.guild.roles.create({
            name: `|${interaction.user.id}|`,
            color: validHexCode,
            position: 1, // Set this to 1 to place the role at the bottom
          });

          // Add the role to the user
          await interaction.member.roles.add(role);

          // Update the confirmation message
          await i.editReply({
            embeds: [
              initialEmbed.setDescription(
                "✅ Color role added successfully.\n**Hex Code:** " +
                  validHexCode,
              ),
            ],
          });
        } catch (error) {
          interaction.followUp({
            content: `❌ An error occurred while processing your request.\n${error}`,
            ephemeral: true,
          });
        }

        // Stop the collector
        collector.stop();
      }
    });

    collector.on("end", (collected, reason) => {
      if (reason === "time") {
        // Check if no one has interacted with the buttons
        if (collected.size === 0) {
          // Update the message with disabled buttons
          initialMessage.edit({
            embeds: [
              initialEmbed.setDescription(
                "⏰ Auto-canceled, no one responded. :/\n**Hex Code:** " +
                  validHexCode,
              ),
            ],
            components: [
              new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setCustomId("confirm")
                  .setLabel("Confirm")
                  .setStyle(ButtonStyle.Secondary)
                  .setDisabled(true),
                new ButtonBuilder()
                  .setCustomId("cancel")
                  .setLabel("Cancel")
                  .setStyle(ButtonStyle.Secondary)
                  .setDisabled(true),
              ),
            ],
          });
        }
      }
    });
  },
};
