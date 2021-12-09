import { config } from "dotenv";
config();
import { Client, Intents } from "discord.js";
import { commands, registerCommands } from "./commands/register";

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.on("ready", async (client) => {
  console.log(`Logged in as ${client.user?.tag}!`);
  await registerCommands(client.application?.id ?? "");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  commands.get(interaction.commandName)?.handler(
    interaction,
    interaction.options.data.reduce(
      (acc, curr) => ({
        ...acc,
        [curr.name]: curr.value,
      }),

      {},
    ),
  );
});

client.login(process.env.TOKEN);
