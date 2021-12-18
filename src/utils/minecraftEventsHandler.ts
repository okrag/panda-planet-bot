import { Client, MessageEmbed } from "discord.js";
import { getGuild } from "./getGuild";
import { getTextChannels } from "./getTextChannel";
import { EventHandler } from "./minecraftConnection";

export const setup = async (client: Client) => {
  const guild = getGuild(client);
  if (!guild) return;

  const [reportsChannel, logsChannel, deathsChannel] = await getTextChannels(
    guild,
    process.env.REPORT_CHANNEL_ID,
    process.env.LOGS_CHANNEL_ID,
    process.env.DEATHS_CHANNEL_ID,
  );

  if (!reportsChannel || !logsChannel || !deathsChannel) return;

  const events = new EventHandler(10 * 1000, guild);

  events.on("report", (event) => {
    const member = guild?.members.cache.get(event.user);
    if (!member) return;

    const embed = new MessageEmbed()
      .setTitle("Report")
      .setColor("#ff0000")
      .addField("Gracz", member.user.tag)
      .addField("Treść", event.data)
      .setFooter(new Date(event.timestamp).toLocaleString());
    reportsChannel.send({ content: "@here", embeds: [embed] });
  });

  events.on("log", (event) => {
    const embed = new MessageEmbed()
      .setTitle(event.data.charAt(0).toUpperCase() + event.data.slice(1))
      .setColor("#ff0000")
      .addField("Gracz", event.user)
      .setFooter(new Date(event.timestamp).toLocaleString());
    logsChannel.send({ embeds: [embed] });
  });

  events.on("death", (event) => {
    const embed = new MessageEmbed()
      .setTitle("Log śmierci")
      .setColor("#ff0000")
      .addField("Gracz", event.user)
      .addField("Powód śmierci", event.data.damageCause)
      .addField("Komunikat o śmierci", event.data.deathMessage)
      .setFooter(new Date(event.timestamp).toLocaleString());

    if (event.data.killerType) embed.addField("Rodzaj zabójcy", event.data.killerType);
    if (event.data.killerName) embed.addField("Nazwa zabójcy", event.data.killerName);

    deathsChannel.send({ embeds: [embed] });
  });
};
