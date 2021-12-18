import { config } from "dotenv";
config();
import { Client, GuildMemberRoleManager, Intents } from "discord.js";
import { commands, registerCommands } from "./commands/register";
import { setup } from "./utils/minecraftEventsHandler";

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_BANS,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_PRESENCES,
  ],
});

client.on("ready", async (client) => {
  console.log(`Logged in as ${client.user?.tag}!`);

  await registerCommands(client);
  setup(client);
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isButton()) {
    const [commandId, instanceId, ...rest] = interaction.customId.split(";");

    for (const command of commands.values()) {
      if (command.commandId !== commandId) continue;
      command.runButtonAction(interaction, instanceId, rest.join(";"), client);
    }
    return;
  }
  if (!interaction.isCommand()) return;
  const command = commands.get(interaction.commandName);

  const { roles } = interaction.member as { roles: GuildMemberRoleManager };

  if (command?.permittedRoles && !command.permittedRoles.some((v) => !!roles.cache.get(v))) return;

  command?.run(interaction, client);
});

client.login(process.env.TOKEN);
