const { GuildMember, EmbedBuilder, WebhookClient } = require("discord.js");
const color = require("../utils/colors");

module.exports = {
  name: "guildMemberAdd",
  /**
   *
   * @param {GuildMember} member
   * @param {Client} client
   */
  async execute(member, client) {
    const webhookClient = new WebhookClient({
      url: ` https://discord.com/api/webhooks/1179645099269963787/UpKt6PkGGQdzXl337DdBtC7CZr598koXAnzBYLxsC4KJouEfq-jHBCzrj2TITXOIL1j9`,
    });

    const embed = new EmbedBuilder()
      .setAuthor({
        name: member.guild.name,
        iconURL: member.guild.iconURL({ dynamic: true, size: 256 }),
      })
      .setTitle(`✧ 𝙒𝙀𝙇𝘾𝙊𝙈𝙀 ✧`)
      .setColor(color.Default) // Use a color from your fashion theme
      .setDescription(
        `Welcome, ${member}! 🌟\n\nStep into ${member.guild.name} and make yourself at home. Let's have some fun with fashion! 💃🕺`
      )
      .addFields({
        name: `👠 Explore these channels:`,
        value: `<#1177810952536731669>\n<#1177811458692759652>\n<#1177812261159567443>`,
      })
      .setThumbnail(`${member.displayAvatarURL({ dynamic: true, size: 256 })}`)
      .setImage(
        `https://media.discordapp.net/attachments/1177814801997639762/1179391163539673088/womenswear_retail_store_design_and_shop_layout_interiordesign_architect_retaildesign_shopdisplay_shopfitting.jpg?ex=65799c9d&is=6567279d&hm=0ef194c9e3ddef515d049624eefe9a36959ea1614bd76afa18f4833d2d14b214&=&format=webp`
      )
      .setFooter({ text: `Have fun with fashion! 👗👔` });

    webhookClient.send({ embeds: [embed] });
  },
};
