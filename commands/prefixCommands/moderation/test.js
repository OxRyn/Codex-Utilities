const { AttachmentBuilder, EmbedBuilder } = require("discord.js");
const Image = require("../../../utils/images");

module.exports = {
  name: "embed",
  description: "something goes here idk :/",
  aliases: [],
  run: async (client, message) => {
    // ...
    // const file = new AttachmentBuilder("./assets/images/amnaFooter2.png");
    const exampleEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("Some title")
      .setURL("https://discord.js.org/")
      .setAuthor({
        name: "Some name",
        iconURL: "attachment://amnaStaff1.png",
        url: "https://discord.js.org",
      })
      .setDescription("Some description here")
      .setThumbnail("attachment://amnaStaff1.png")
      .addFields(
        { name: "Regular field title", value: "Some value here" },
        { name: "\u200B", value: "\u200B" },
        { name: "Inline field title", value: "Some value here", inline: true },
        { name: "Inline field title", value: "Some value here", inline: true }
      )
      .addFields({
        name: "Inline field title",
        value: "Some value here",
        inline: true,
      })
      .setImage("attachment://amnaStaff1.png")
      .setTimestamp()
      .setFooter({
        text: "Some footer text here",
        iconURL: "attachment://amnaStaff1.png",
      });

    message.channel.send({
      embeds: [exampleEmbed],
      files: [Image.amnaStaff1],
    });
  },
};
