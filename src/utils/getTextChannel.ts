import { Channel, Guild } from "discord.js";

export const getTextChannels = async (guild: Guild, ...ids: (string | undefined)[]) => {
  const promises: Promise<Channel>[] = [];

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];

    const promise = guild.channels.cache.get(id ?? "")?.fetch();

    if (!promise) continue;

    promises.push(promise);
  }

  const channels = await Promise.all(promises);

  return channels.map((channel) => {
    if (!channel?.isText()) {
      return undefined;
    }
    return channel;
  });
};
