import { config } from "dotenv";
config();
import { Client, GuildMemberRoleManager, Intents } from "discord.js";
import { commands, registerCommands } from "./commands/register";

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS] });

client.on("ready", async (client) => {
  console.log(`Logged in as ${client.user?.tag}!`);

  await registerCommands(client.application?.id ?? "");
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isButton()) {
    const [commandId, instanceId, ...rest] = interaction.customId.split(";");

    for (const command of commands.values()) {
      if (command.commandId !== commandId) continue;
      command.runButtonAction(interaction, instanceId, rest.join(";"));
    }
    return;
  }
  if (!interaction.isCommand()) return;
  const command = commands.get(interaction.commandName);

  const { roles } = interaction.member as { roles: GuildMemberRoleManager };

  if (command?.permittedRoles && !command.permittedRoles.some((v) => !!roles.cache.get(v))) return;

  command?.run(
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
