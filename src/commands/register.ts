import { readdir } from "fs/promises";
import { join } from "path";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";

interface Command {
  name: string;
  description: string;
  handler: () => void;
}

const rest = new REST({ version: "9" }).setToken(process.env.TOKEN ?? "");

export const commands = new Map<string, Command>();

export const registerCommands = async (CLIENT_ID: string) => {
  const commandsArray = [];

  if (commands.size == 0) {
    const files = await readdir(__dirname);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.endsWith(".command.ts") || file.endsWith(".command.js")) {
        const module = await import(join(__dirname, file));
        commands.set(module.name, {
          name: module.name,
          description: module.description,
          handler: module.handler,
        });
        commandsArray.push({
          name: module.name,
          description: module.description,
        });
      }
    }
  } else {
    commands.forEach((value) => {
      commandsArray.push({ name: value.name, description: value.description });
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
