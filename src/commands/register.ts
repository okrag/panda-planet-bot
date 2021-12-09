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
import { ButtonInteraction, Channel, CommandInteraction, Role, User } from "discord.js";
import { v4 as uuid } from "uuid";

export interface Command<
  State,
  Options extends APIApplicationCommandOption[] | readonly APIApplicationCommandOption[] =
    | APIApplicationCommandOption[]
    | readonly APIApplicationCommandOption[],
> {
  options?: Options;
  name: string;
  description: string;
  type?: ApplicationCommandPermissionType;
  default_permission?: boolean;
  handler: (
    interaction: CommandInteraction,
    commandOptions: OptionsMap<Options>,
    setState: (state: State) => void,
    getState: () => State,
    id: string,
  ) => void;
  run: (interaction: CommandInteraction, commandOptions: OptionsMap<Options>) => void;
  runButtonAction: (interacton: ButtonInteraction, instanceId: string, id: string) => void;
  buttonAction: (
    interacton: ButtonInteraction,
    setState: (state: State) => void,
    getState: () => State,
    instanceId: string,
    id: string,
  ) => void;
  commandId: string;
  category?: string;
  permittedRoles?: string[];
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

type SingleOptionMap<
  Index extends number,
  Options extends APIApplicationCommandOption[] | readonly APIApplicationCommandOption[],
> = { [P in Options[Index]["name"]]: OptionTypeMap[Options[Index]["type"]] };

export type OptionsMap<
  Options extends APIApplicationCommandOption[] | readonly APIApplicationCommandOption[],
> = SingleOptionMap<0, Options> &
  SingleOptionMap<1, Options> &
  SingleOptionMap<2, Options> &
  SingleOptionMap<3, Options> &
  SingleOptionMap<4, Options> &
  SingleOptionMap<5, Options>;

const rest = new REST({ version: "9" }).setToken(process.env.TOKEN ?? "");

export const commands = new Map<string, Command<any>>();

export const mapCommandToAPI = (value: Command<any>): Partial<APIApplicationCommand> => ({
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
        let state: Record<string, any> = {};
        commands.set(module.name, {
          ...module,
          run(interaction, commandOptions) {
            const id = uuid();
            state[id] = null;
            this.handler(
              interaction,
              commandOptions,
              (v) => {
                state[id] = v;
              },
              () => state[id],
              id,
            );
          },
          runButtonAction(interaction, instance, id) {
            this.buttonAction(
              interaction,
              (v) => {
                state[instance] = v;
              },
              () => state[instance],
              instance,
              id,
            );
          },
        });
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
