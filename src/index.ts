import { config } from "dotenv";
config();
import { Client, Intents } from "discord.js";
import { registerCommands } from "./commands/register";

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.on("ready", () => {
  console.log(`Logged in as ${client.user?.tag}!`);
  registerCommands(client.application?.id ?? "");
});

client.login(process.env.TOKEN);
