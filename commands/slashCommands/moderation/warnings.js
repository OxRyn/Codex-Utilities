const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ActionRowBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const Database = require("../../../schemas/infractions.js");
const colors = require("../../../utils/colors.js");

// Function to create an embed with infractions
function createInfractionsText(infractions, pageIndex) {
  const start = pageIndex * 5;
  const end = start + 5;
  const slicedInfractions = infractions.slice(start, end);

  return slicedInfractions
    .map((infraction, index) => {
      const num = start + index + 1;
      return `- **Infraction ${num}**\n - <:staff:1163793833226666025> Action: \`${
        infraction.Action
      }\`\n - <:message:1163793782819524628> Reason: \`${
        infraction.Reason
      }\`\n - <:stopwatch:1163793840155664416> Time: \`${new Date(
        infraction.Date
      ).toLocaleString()}\`\n - <:Moderation:1163793787793965117> Staff Member: <@${
        infraction.IssuerID
      }>`;
    })
    .join("\n\n");
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("📜 Fetch a user's infractions.")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false)
    .addUserOption((options) =>
      options
        .setName("target")
        .setDescription("🎯 Select the target member.")
        .setRequired(true)
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { options, guild } = interaction;
    const target = options.getMember("target");

    const errorsEmbed = new EmbedBuilder()
      .setAuthor({
        name: "Could not fetch infractions due to",
        iconURL:
          "https://media.discordapp.net/attachments/1147489563648983060/1156561255138611281/amnaError1.png?ex=65156b1b&is=6514199b&hm=4723faa01a55c017f652fd75496420e113871bc20646ccafb95769ab6abaa4f1&=",
      })
      .setColor(colors.Error);

    try {
      // Check if the target member is valid
      if (!target) {
        return interaction.reply({
          embeds: [
            errorsEmbed.setDescription("Invalid target member provided."),
          ],
          ephemeral: true,
        });
      }

      // Fetch the user's infractions from the database
      const userData = await Database.findOne({
        Guild: guild.id,
        User: target.id,
      });

      if (
        !userData ||
        !userData.Infractions ||
        userData.Infractions.length === 0
      ) {
        return interaction.reply({
          embeds: [
            errorsEmbed.setDescription(
              "✨ No infractions found for this user."
            ),
          ],
          ephemeral: true,
        });
      }

      // Set the initial page index to 0
      let currentPageIndex = 0;
      const initialPreviousButtonDisabled = true;

      // Create an initial embed with the first page of infractions
      const initialEmbed = new EmbedBuilder()
        .setAuthor({
          name: `${target.user.username} | ${target.id}`,
          iconURL: `${target.displayAvatarURL({ size: 256, dynamic: true })}`,
        })
        .setTitle("User Infractions")
        .setColor(colors.Default)
        .setDescription(
          `**Infractions for ${target.user}**\n\n${createInfractionsText(
            userData.Infractions,
            currentPageIndex
          )}`
        )
        .setFooter({
          text: `/warnings | Page ${currentPageIndex + 1}/${Math.ceil(
            userData.Infractions.length / 5
          )}`,
        })
        .setTimestamp();

      // Create the initial pagination buttons with the disabled status
      const previousButton = new ButtonBuilder()
        .setCustomId("previousPage")
        .setStyle(2)
        .setEmoji("<:leftArrow:1163793768571482132>")
        .setDisabled(initialPreviousButtonDisabled); // Set the disabled status

      const nextButton = new ButtonBuilder()
        .setCustomId("nextPage")
        .setStyle(2)
        .setEmoji("<:rightArrow:1163793807544963142>");

      const actionRow = new ActionRowBuilder().addComponents(
        previousButton,
        nextButton
      );

      // Send the initial embed with pagination buttons
      const message = await interaction.reply({
        embeds: [initialEmbed],
        components: [actionRow],
      });

      // Create a collector for button interactions
      const filter = (interaction) =>
        interaction.customId === "previousPage" ||
        interaction.customId === "nextPage";

      const collector = message.createMessageComponentCollector({
        filter,
        time: 60000,
      });

      collector.on("collect", async (buttonInteraction) => {
        if (buttonInteraction.customId === "previousPage") {
          // Decrement the page index
          currentPageIndex--;

          // Update the disabled status of the previous button
          previousButtonDisabled = currentPageIndex === 0;

          // Enable the next button
          nextButtonDisabled = false;
        } else if (buttonInteraction.customId === "nextPage") {
          // Increment the page index
          currentPageIndex++;

          // Update the disabled status of the next button
          nextButtonDisabled =
            currentPageIndex >= Math.ceil(userData.Infractions.length / 5) - 1;

          // Enable the previous button
          previousButtonDisabled = false;
        }

        // Create and send the updated embed with updated button styles
        const updatedEmbed = new EmbedBuilder()
          .setAuthor({
            name: `${target.user.username} | ${target.id}`,
            iconURL: `${target.displayAvatarURL({ size: 256, dynamic: true })}`,
          })
          .setTitle("User Infractions")
          .setColor(colors.Default)
          .setDescription(
            `**Infractions for ${target.user.tag}**\n\n${createInfractionsText(
              userData.Infractions,
              currentPageIndex
            )}`
          )
          .setFooter({
            text: `/warnings | Page ${currentPageIndex + 1}/${Math.ceil(
              userData.Infractions.length / 5
            )}`,
          })
          .setTimestamp();

        // Create the pagination buttons with updated disabled status
        const previousButton = new ButtonBuilder()
          .setCustomId("previousPage")
          .setStyle(2)
          .setEmoji("<:amnaLeft1:1159765920739242014>")
          .setDisabled(previousButtonDisabled); // Set the disabled status

        const nextButton = new ButtonBuilder()
          .setCustomId("nextPage")
          .setStyle(2)
          .setEmoji("<:amnaRight1:1159765923725586442>")
          .setDisabled(nextButtonDisabled); // Set the disabled status

        const actionRow = new ActionRowBuilder().addComponents(
          previousButton,
          nextButton
        );

        await buttonInteraction.update({
          embeds: [updatedEmbed],
          components: [actionRow],
        });
      });

      // End the collector after 60 seconds
      collector.on("end", () => {
        message.edit({
          components: [], // Remove the pagination buttons
        });
      });
    } catch (error) {
      console.error("Error occurred while fetching infractions:", error);
      interaction.reply({
        embeds: [
          errorsEmbed.setDescription(
            "Could not fetch infractions due to an error."
          ),
        ],
      });
    }
  },
};
