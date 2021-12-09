import { config } from "dotenv";
config();
import { Client, Intents } from "discord.js";

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.on("ready", () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

client.login("token");
