const ConsoleStyles = require("../utils/chalk");
const configDatabase = require("../schemas/memberLog");

async function loadConfig(client) {
  (await configDatabase.find()).forEach((doc) => {
    client.guildConfig.set(doc.Guild, {
      logChannel: doc.logChannel,
      memberRole: doc.memberRole,
      botRole: doc.botRole,
    });
  });

  return console.log(
    `${ConsoleStyles.info(`[i]`)} ${ConsoleStyles.string(
      `Loaded guild configs to the collection.`
    )}`
  );
}

module.exports = { loadConfig };
