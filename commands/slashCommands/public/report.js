const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  EmbedBuilder,
  ChatInputCommandInteraction,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const { randomUUID } = require("crypto");
const colors = require("../../../utils/colors.js");
const ReportChannel = require("../../../schemas/reportChannel.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("report")
    .setDescription("🎫 Report a Bug, User or Moderation Action.")
    .setDMPermission(false)
    .addSubcommand((command) =>
      command.setName("bug").setDescription("Report a bug to the devs.")
    )
    .addSubcommand((command) =>
      command
        .setName("user")
        .setDescription("Report a user to the moderation team.")
        .addUserOption((options) =>
          options
            .setName("member")
            .setDescription("Target user you want to report.")
            .setRequired(true)
        )
        .addStringOption((options) =>
          options
            .setName("reason")
            .setDescription("Reason for the report")
            .setRequired(true)
        )
    )
    .addSubcommand((command) =>
      command
        .setName("moderation-action")
        .setDescription("Report a moderation action taken by a staff member.")
        .addUserOption((options) =>
          options
            .setName("staff-member")
            .setDescription("Staff member who took the action.")
            .setRequired(true)
        )
        .addStringOption((options) =>
          options
            .setName("query")
            .setDescription("Explain what happened.")
            .setRequired(true)
        )
    ),

  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @returns
   */
  async execute(interaction, client) {
    const { user, guild, options } = interaction;
    const sub = options.getSubcommand();

    // At the top of your file, define your global cooldown duration (in milliseconds).
    const globalCooldownDuration = 10000; // 10 seconds

    // Define a global cooldowns map to store the cooldown expiration time for each user.
    const globalCooldowns = new Map();

    // Inside your execute function:

    const userId = interaction.user.id;

    if (globalCooldowns.has(userId)) {
      const globalCooldownExpiration = globalCooldowns.get(userId);
      const currentTime = Date.now();

      if (currentTime < globalCooldownExpiration) {
        const timeLeft = Math.ceil(
          (globalCooldownExpiration - currentTime) / 1000
        );

        const cooldownMessage = await interaction.reply({
          content: `⏳ You can use this command again in ${timeLeft} seconds.`,
          ephemeral: true,
        });

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

    // If there's no global cooldown or the global cooldown has expired, set a new global cooldown and execute the command.
    globalCooldowns.set(userId, Date.now() + globalCooldownDuration);

    switch (sub) {
      case "bug":
        const channelID = "1156444632364883990"; // Replace with your custom channel ID
        const guildID = "1141722797928894494"; // Replace with your custom guild ID

        const guild1 = await client.guilds.fetch(guildID);
        const channel = guild1.channels.cache.get(channelID);
        if (!channel) {
          const errorEmbed = new EmbedBuilder()
            .setAuthor({
              name: "Could not send bug report",
              iconURL:
                "https://media.discordapp.net/attachments/1147489563648983060/1156561255138611281/amnaError1.png?ex=651613db&is=6514c25b&hm=f2e9bc531210824e533dd03543a57c5ad2e26795c66ee482a3c3c268a8201e2a&=",
            })
            .setColor(colors.error)
            .setDescription(
              "Bug report channel not found. Please contact a server admin."
            );
          return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
        const filter2 = (interaction) =>
          interaction.customId === "report-modal" &&
          interaction.user.id === interaction.user.id;

        const modal = new ModalBuilder()
          .setCustomId("report-modal")
          .setTitle("Report a bug or ask the devs for a feature.");

        const reportText = new TextInputBuilder()
          .setCustomId("report-text")
          .setLabel("So what you gonna report huh?!")
          .setStyle(TextInputStyle.Paragraph)
          .setMaxLength(512);

        const modalActionRow = new ActionRowBuilder().addComponents(reportText);

        modal.addComponents(modalActionRow);

        await interaction.showModal(modal);

        const modalInteraction = await interaction
          .awaitModalSubmit({
            filter2,
            time: 1000 * 60 * 3,
          })
          .catch((error) => {
            interaction.followUp({
              content: "Error: Timeout - user didnt respond",
              ephemeral: true,
            });
          });

        if (!modalInteraction) {
          return;
        }

        const reportFromUser =
          modalInteraction.fields.getTextInputValue("report-text");

        const userAvatarURL = user.displayAvatarURL({ dynamic: true });
        const reportEmbed = new EmbedBuilder()
          .setColor(colors.Default)
          .setAuthor({
            name: `Bug Report by ${user.tag}`,
            iconURL: userAvatarURL,
          })
          .setDescription(`**Bug report:**\n${reportFromUser}`)
          .addFields({ name: "User ID", value: `${user.id}`, inline: true })
          .addFields({
            name: "Username",
            value: `${user.username}`,
            inline: true,
          })
          .addFields({
            name: "Time",
            value: `${interaction.createdAt.toLocaleTimeString()}`,
            inline: true,
          })
          .addFields({
            name: "Date",
            value: `${interaction.createdAt.toDateString()}`,
            inline: true,
          })
          .addFields({
            name: "Guild ID",
            value: `${interaction.guild.id}`,
            inline: true,
          })
          .addFields({
            name: "Guild Name",
            value: `${interaction.guild.name}`,
            inline: true,
          })
          .addFields({
            name: "Report ID",
            value: `\`${randomUUID()}\``,
            inline: false,
          })
          .setImage(
            "https://media.discordapp.net/attachments/1147489563648983060/1156477162019377152/amnaFooter2.png?ex=65151cc9&is=6513cb49&hm=9eaddae520c730e3097507f92b8b678c7964faf8807fbb9c33f1f0501a84fcd9&="
          );

        channel.send({ embeds: [reportEmbed] });

        modalInteraction.reply({
          content: "Bug report sent successfully!",
          ephemeral: true,
        });
        break;

      case "user":
        const reporter = interaction.user;
        const reportedUser = options.getUser("member");
        const reason = options.getString("reason");

        try {
          const reportChannelData = await ReportChannel.findOne({
            Guild: interaction.guild.id,
          });

          if (!reportChannelData) {
            const errorEmbed = new EmbedBuilder()
              .setAuthor({
                name: "Could not send report",
                iconURL:
                  "https://media.discordapp.net/attachments/1147489563648983060/1156561255138611281/amnaError1.png?ex=651613db&is=6514c25b&hm=f2e9bc531210824e533dd03543a57c5ad2e26795c66ee482a3c3c268a8201e2a&=",
              })
              .setColor(colors.error)
              .setDescription(
                "The report channel has not been set. Please use `/set-report-channel` to set it."
              );
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
          }

          const reportChannelId = reportChannelData.ChannelId;
          const reportChannel =
            interaction.guild.channels.cache.get(reportChannelId);

          if (!reportChannel) {
            const errorEmbed = new EmbedBuilder()
              .setAuthor({
                name: "Could not send report",
                iconURL:
                  "https://media.discordapp.net/attachments/1147489563648983060/1156561255138611281/amnaError1.png?ex=651613db&is=6514c25b&hm=f2e9bc531210824e533dd03543a57c5ad2e26795c66ee482a3c3c268a8201e2a&=",
              })
              .setColor(colors.error)
              .setDescription(
                "The configured report channel does not exist. Please reconfigure it using `/set-report-channel`."
              );
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
          }

          const reportEmbed = new EmbedBuilder()
            .setColor(colors.Default)
            .setTitle("User Report")
            .setDescription(`**Reason:**\n${reason}`)
            .setFields(
              { name: "Reporter", value: `${reporter}`, inline: true },
              {
                name: "Reported User",
                value: `${reportedUser}`,
                inline: true,
              },
              {
                name: "Date",
                value: `${interaction.createdAt.toDateString()}`,
                inline: true,
              },
              {
                name: `Report Id`,
                value: `\`${randomUUID()}\``,
                inline: false,
              }
            )
            .setImage(
              "https://media.discordapp.net/attachments/1147489563648983060/1156477162019377152/amnaFooter2.png?ex=65151cc9&is=6513cb49&hm=9eaddae520c730e3097507f92b8b678c7964faf8807fbb9c33f1f0501a84fcd9&="
            );

          await reportChannel.send({ embeds: [reportEmbed] });

          interaction.reply({
            content: "Report sent successfully.",
            ephemeral: true,
          });
        } catch (error) {
          console.error(error);
          const errorEmbed = new EmbedBuilder()
            .setAuthor({
              name: "Could not send report",
              iconURL:
                "https://media.discordapp.net/attachments/1147489563648983060/1156561255138611281/amnaError1.png?ex=651613db&is=6514c25b&hm=f2e9bc531210824e533dd03543a57c5ad2e26795c66ee482a3c3c268a8201e2a&=",
            })
            .setColor(colors.error)
            .setDescription("An error occurred while processing your report.");
          interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
        break;
      case "moderation-action":
        const { ownerId } = guild;
        const owner = `<@${ownerId}>`;
        const reportedStaff = options.getUser("staff-member");
        const moderationReason = options.getString("query");

        const staffReport = new EmbedBuilder()
          .setAuthor({
            name: `${interaction.client.user.tag}`,
            iconURL: interaction.client.user.displayAvatarURL({ size: 256 }),
          })
          .setTitle("Staff Report")
          .setDescription(`**Reason:**\n${moderationReason}`)
          .setFields(
            { name: `Reporter`, value: `${interaction.user}`, inline: true },
            { name: `Reported Staff`, value: `${reportedStaff}`, inline: true },
            {
              name: "Date",
              value: `${interaction.createdAt.toDateString()}`,
              inline: true,
            },
            { name: `Report Id`, value: `\`${randomUUID()}\``, inline: false }
          )
          .setImage(
            "https://media.discordapp.net/attachments/1147489563648983060/1156477162019377152/amnaFooter2.png?ex=65151cc9&is=6513cb49&hm=9eaddae520c730e3097507f92b8b678c7964faf8807fbb9c33f1f0501a84fcd9&="
          )
          .setFooter({ text: `/report moderation-action` })
          .setTimestamp();

        try {
          await interaction.client.users.cache
            .get(ownerId)
            .send({ embeds: [staffReport] });
          interaction.reply({
            content: `Your report has been sent to the owner: ${owner}`,
            ephemeral: true,
          });
        } catch (error) {
          console.error(error);
          const errorEmbed = new EmbedBuilder()
            .setAuthor({
              name: "Could not send report",
              iconURL:
                "https://media.discordapp.net/attachments/1147489563648983060/1156561255138611281/amnaError1.png?ex=651613db&is=6514c25b&hm=f2e9bc531210824e533dd03543a57c5ad2e26795c66ee482a3c3c268a8201e2a&=",
            })
            .setColor(colors.error)
            .setDescription(
              "An error occurred while sending the staff report to the server owner."
            );
          interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
        break;
    }
  },
};
