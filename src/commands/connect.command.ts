import { ApplicationCommandOptionType } from "discord-api-types";
import { CommandInteraction } from "discord.js";
import { OptionsMap } from "./register";

export const name = "connect";
export const description = "Połączenie konta mc z kontem discord";
export const options = [
  {
    name: "nick",
    description: "Twój nick w mc",
    type: ApplicationCommandOptionType.String,
    required: true,
    autocompletion: false,
  },
] as const;

export const handler = async (
  interaction: CommandInteraction,
  commandOptions: OptionsMap<typeof options>,
) => {
  await interaction.reply("Connecting.. " + commandOptions.nick);
  // TODO: Add rcon connection
};
