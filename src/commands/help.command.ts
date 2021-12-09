import { CommandInteraction } from "discord.js";
import { commands } from "./register";

export const name = "help";
export const description = "Pokazuje listę dostępnych komend";

export const handler = async (interaction: CommandInteraction) => {
  const commandsArray = [];
  for (const iterator of commands.values()) {
    commandsArray.push(iterator);
  }
  await interaction.reply(JSON.stringify(commandsArray));
  // TODO: Add better help command
};
