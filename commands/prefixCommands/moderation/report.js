const { EmbedBuilder } = require("discord.js");
const { randomUUID } = require("crypto");
const colors = require("../../../utils/colors.js");
const ReportChannel = require("../../../schemas/reportChannel.js");

module.exports = {
  name: "report",
  description: "🎫 Report a Bug, User or Moderation Action.",
  aliases: ["REPORT"],
  run: async (client, message, args) => {
    let reportType = args[0];

    if (reportType == "bug") {
      const msg = args.slice(1).join(" ") || "No reason provided";
      const channelID = "1173561259401166861"; // Replace with your custom channel ID
      const guildID = "1173561259401166858"; // Replace with your custom guild ID

      const guild1 = await client.guilds.fetch(guildID);
      const channel = guild1.channels.cache.get(channelID);
      if (!channel) {
        const errorEmbed = new EmbedBuilder()
          .setAuthor({
            name: "Could not send bug report",
            iconURL:
              "https://media.discordapp.net/attachments/1147489563648983060/1156561255138611281/amnaError1.png?ex=651613db&is=6514c25b&hm=f2e9bc531210824e533dd03543a57c5ad2e26795c66ee482a3c3c268a8201e2a&=",
          })
          .setColor(colors.Error)
          .setDescription(
            "Bug report channel not found. Please contact a server admin."
          );
        return message.reply({ embeds: [errorEmbed], ephemeral: true });
      }

      const userAvatarURL = message.author.displayAvatarURL({ dynamic: true });
      const reportEmbed = new EmbedBuilder()
        .setColor(colors.Default)
        .setAuthor({
          name: `Bug Report by ${message.author.tag}`,
          iconURL: userAvatarURL,
        })
        .setDescription(`**Bug report:**\n${msg}`)
        .addFields({
          name: "User ID",
          value: `${message.author.id}`,
          inline: true,
        })
        .addFields({
          name: "Username",
          value: `${message.author.username}`,
          inline: true,
        })
        .addFields({
          name: "Time",
          value: `${message.createdAt.toLocaleTimeString()}`,
          inline: true,
        })
        .addFields({
          name: "Date",
          value: `${message.createdAt.toDateString()}`,
          inline: true,
        })
        .addFields({
          name: "Guild ID",
          value: `${message.guild.id}`,
          inline: true,
        })
        .addFields({
          name: "Guild Name",
          value: `${message.guild.name}`,
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
    }

    if (reportType == "user") {
      const reportedUser = message.mentions.members.first();

      if (!reportedUser) {
        return message.channel.send("Please mention a member to report.");
      }
      const reporter = message.author;
      const msg = args.slice(1).join(" ") || "No reason provided";

      try {
        const reportChannelData = await ReportChannel.findOne({
          Guild: message.guild.id,
        });

        if (!reportChannelData) {
          const errorEmbed = new EmbedBuilder()
            .setAuthor({
              name: "Could not send report",
              iconURL:
                "https://media.discordapp.net/attachments/1147489563648983060/1156561255138611281/amnaError1.png?ex=651613db&is=6514c25b&hm=f2e9bc531210824e533dd03543a57c5ad2e26795c66ee482a3c3c268a8201e2a&=",
            })
            .setColor(colors.Error)
            .setDescription(
              "The report channel has not been set. Please use `/set-report-channel` to set it."
            );
          return message.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        const reportChannelId = reportChannelData.ChannelId;
        const reportChannel = message.guild.channels.cache.get(reportChannelId);

        if (!reportChannel) {
          const errorEmbed = new EmbedBuilder()
            .setAuthor({
              name: "Could not send report",
              iconURL:
                "https://media.discordapp.net/attachments/1147489563648983060/1156561255138611281/amnaError1.png?ex=651613db&is=6514c25b&hm=f2e9bc531210824e533dd03543a57c5ad2e26795c66ee482a3c3c268a8201e2a&=",
            })
            .setColor(colors.Error)
            .setDescription(
              "The configured report channel does not exist. Please reconfigure it using `/set-report-channel`."
            );
          return message.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        const reportEmbed = new EmbedBuilder()
          .setColor(colors.Default)
          .setTitle("User Report")
          .setDescription(`**Reason:**\n${msg}`)
          .setFields(
            { name: "Reporter", value: `${reporter}`, inline: true },
            {
              name: "Reported User",
              value: `${reportedUser}`,
              inline: true,
            },
            {
              name: "Date",
              value: `${message.createdAt.toDateString()}`,
              inline: true,
            },
            { name: `Report Id`, value: `\`${randomUUID()}\``, inline: false }
          )
          .setImage(
            "https://media.discordapp.net/attachments/1147489563648983060/1156477162019377152/amnaFooter2.png?ex=65151cc9&is=6513cb49&hm=9eaddae520c730e3097507f92b8b678c7964faf8807fbb9c33f1f0501a84fcd9&="
          );

        await reportChannel.send({ embeds: [reportEmbed] });

        message.reply({
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
          .setColor(colors.Error)
          .setDescription("An error occurred while processing your report.");
        message.reply({ embeds: [errorEmbed], ephemeral: true });
      }
    }
  },
};
