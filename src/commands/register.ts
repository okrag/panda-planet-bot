import { readdir } from "fs/promises";
import { join } from "path";
import { REST } from "@discordjs/rest";
import {
  Routes,
  APIApplicationCommand,
  APIApplicationCommandOption,
  ApplicationCommandOptionType,
  ApplicationCommandPermissionType,
} from "discord-api-types/v9";
import { Channel, CommandInteraction, Role, User } from "discord.js";

export interface Command<
  Options extends APIApplicationCommandOption[] | readonly APIApplicationCommandOption[] =
    | APIApplicationCommandOption[]
    | readonly APIApplicationCommandOption[],
> {
  options?: Options;
  name: string;
  description: string;
  type?: ApplicationCommandPermissionType;
  default_permission?: boolean;
  handler: (interaction: CommandInteraction, commandOptions: OptionsMap<Options>) => void;
}
export type OptionTypeMap = {
  [ApplicationCommandOptionType.Boolean]: boolean;
  [ApplicationCommandOptionType.Channel]: Channel;
  [ApplicationCommandOptionType.Integer]: number;
  [ApplicationCommandOptionType.Mentionable]: User | Role;
  [ApplicationCommandOptionType.Number]: number;
  [ApplicationCommandOptionType.Role]: Role;
  [ApplicationCommandOptionType.String]: string;
  [ApplicationCommandOptionType.Subcommand]: any;
  [ApplicationCommandOptionType.SubcommandGroup]: any;
  [ApplicationCommandOptionType.User]: User;
};
export type OptionsMap<
  Options extends APIApplicationCommandOption[] | readonly APIApplicationCommandOption[],
> = Record<Options[number]["name"], OptionTypeMap[Options[number]["type"]]>;

const rest = new REST({ version: "9" }).setToken(process.env.TOKEN ?? "");

export const commands = new Map<string, Command>();

export const mapCommandToAPI = (value: Command): Partial<APIApplicationCommand> => ({
  name: value.name,
  description: value.description,
  options: value.options as any,
  default_permission: value.default_permission,
  type: value.type as any,
});

export const registerCommands = async (CLIENT_ID: string) => {
  const commandsArray: Partial<APIApplicationCommand>[] = [];

  if (commands.size == 0) {
    const files = await readdir(__dirname);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.endsWith(".command.ts") || file.endsWith(".command.js")) {
        const module = await import(join(__dirname, file));
        commands.set(module.name, module);
        commandsArray.push(mapCommandToAPI(module));
      }
    }
  } else {
    commands.forEach((value) => {
      commandsArray.push(mapCommandToAPI(value));
    });
  }

  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commandsArray });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
};
