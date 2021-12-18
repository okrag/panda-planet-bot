import { Client } from "discord.js";

export const getGuild = (client: Client) => {
  return client.guilds.cache.get(process.env.GUILD_ID ?? "");
};
