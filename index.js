require("dotenv").config();
const fs = require("fs");
const { REST } = require("@discordjs/rest");
const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  Routes,
} = require("discord.js");
const mongoose = require("mongoose");
const ConsoleStyles = require("./utils/chalk.js");
const config = require("./config.json");
const BotsModel = require("./schemas/bots.js");
const botID = "8802fcee-39fa-4da2-b1c7-9b35dd75fcd2";

mongoose.connect(
  process.env.UPDATE_DATABSE,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

BotsModel.findOne({ BotID: botID })
  .then((bot) => {
    if (bot && bot.discontinued) {
      console.log(
        `${ConsoleStyles.alert(`[a]`)} ${ConsoleStyles.string(
          `This bot has been discontinued. Please contact the developer, amankouhal [DISCORD], for more information.`
        )}`
      );
      process.exit(0);
    } else {
      console.log(
        `${ConsoleStyles.info(`[i]`)} ${ConsoleStyles.string(
          `Bot is up to date.`
        )}`
      );
      mongoose.connection.close();
    }
  })
  .catch((err) => {
    console.error("Error querying the database:", err);
  });

mongoose.connection.on("close", () => {
  client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildModeration,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.AutoModerationExecution,
      GatewayIntentBits.GuildEmojisAndStickers,
    ],
    partials: [
      Partials.GuildMember,
      Partials.User,
      Partials.Message,
      Partials.Channel,
      Partials.Reaction,
    ],
  });

  //Added logging for exceptions and rejection
  process.on("uncaughtException", async function (err) {
    var date = new Date();
    console.log(ConsoleStyles.error(`Caught Exception: ${err.stack}\n`));
    fs.appendFileSync("exception.txt", `${date.toGMTString()}: ${err.stack}\n`);
  });

  process.on("unhandledRejection", async function (err) {
    var date = new Date();
    console.log(ConsoleStyles.error(`Caught Rejection: ${err.stack}\n`));
    fs.appendFileSync("rejection.txt", `${date.toGMTString()}: ${err.stack}\n`);
  });

  //Initialise commands through JSON
  const slashCommands = [];
  client.slashCommands = new Collection();

  fs.readdirSync("./commands/slashCommands/").forEach((dir) => {
    const commandFiles = fs
      .readdirSync(`./commands/slashCommands/${dir}`)
      .filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
      const command = require(`./commands/slashCommands/${dir}/${file}`);
      client.slashCommands.set(command.data.name, command);
      slashCommands.push(command.data.toJSON());
    }
  });

  client.emotes = config.emoji;

  // New code for prefix commands
  const prefixCommands = [];
  client.aliases = new Collection();
  client.prefixCommands = new Collection();

  fs.readdirSync("./commands/prefixCommands/").forEach((dir) => {
    const commandFiles = fs
      .readdirSync(`./commands/prefixCommands/${dir}`)
      .filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
      const command = require(`./commands/prefixCommands/${dir}/${file}`);
      client.prefixCommands.set(command.name, command);
      prefixCommands.push(command);

      // Handle aliases
      if (command.aliases && Array.isArray(command.aliases)) {
        for (const alias of command.aliases) {
          client.aliases.set(alias, command);
        }
      }
    }
  });

  //Register all the commands
  client.once("ready", async function () {
    console.log(
      `${ConsoleStyles.info([`[i]`])} ${ConsoleStyles.string(
        `Loading Configuration... (Config Version: ${
          process.env.CFG_VERSION || "N/A"
        }`
      )})`
    );
    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

    try {
      await rest.put(Routes.applicationCommands(client.user.id), {
        body: slashCommands,
      });
      console.log(
        `${ConsoleStyles.success(`[S]`)} ${ConsoleStyles.string(
          `Commands registered (production)!`
        )}`
      );
      console.log(
        `${ConsoleStyles.success(`[S]`)} ${ConsoleStyles.string(
          `Prefix commands loaded and registered (production)!`
        )}`
      );
    } catch (err) {
      console.error(err);
    }
  });

  const eventFiles = fs
    .readdirSync("./events")
    .filter((file) => file.endsWith(".js")); //Searches all .js files
  for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  }

  client.on("messageCreate", (message) => {
    if (message.author.bot) return;

    if (message.content.startsWith(process.env.PREFIX)) {
      const args = message.content
        .slice(process.env.PREFIX.length)
        .trim()
        .split(/ +/g);
      const commandName = args.shift().toLowerCase();

      // Attempt to get the command using the provided command name or alias
      const command =
        client.prefixCommands.get(commandName) ||
        client.aliases.get(commandName);

      if (command) {
        // Handle prefix command
        if (command.inVoiceChannel && !message.member.voice.channel) {
          return message.channel.send(
            `${client.emotes.error} | You must be in a voice channel!`
          );
        }
        try {
          command.run(client, message, args);
        } catch (e) {
          console.error(e);
          message.channel.send(`${client.emotes.error} | Error: \`${e}\``);
        }
      }
    }
  });

  client.guildConfig = new Collection();

  const { loadConfig } = require("./functions/configLoader");
  loadConfig(client);

  //Authenticate with Discord via .env passed token
  if (!process.env.TOKEN) {
    console.log(
      ConsoleStyles.error(
        `${ConsoleStyles.error(`[E]`)} ${ConsoleStyles.string(
          `The .env file could not be found/doesn't exist.`
        )}`
      )
    );
    process.exit(0);
  }

  module.exports = client;

  client.login(process.env.TOKEN).catch((err) => {
    console.log(
      ConsoleStyles.error(
        `${ConsoleStyles.error(`[E]`)}${ConsoleStyles.string(
          `Bot could not login and authenticate with Discord. Have you populated your .env file with your bot token and copied it over correctly? (Using token: ${process.env.TOKEN})`
        )}\nError Trace: ${err}`
      )
    );
  });

  const dbURI = process.env.MONGO_PASS;

  mongoose
    .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log(
        `${ConsoleStyles.info(`[i]`)} ${ConsoleStyles.string(
          `Connected to MongoDB`
        )}`
      );
      // Define models and routes here
    })
    .catch((err) => console.error("Error connecting to MongoDB:", err));
});
