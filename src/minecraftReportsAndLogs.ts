import { Channel, Client, Guild, MessageEmbed } from "discord.js";
import { connectRcon, getEvents } from "./minecraftConnection";

export const prepareGetMember = async (guild: Guild) => {
  if (guild.members.cache.size === guild.memberCount) return;
  await guild.members.fetch();
};

export const setup = async (client: Client) => {
  await connectRcon();
  const guild = client.guilds.cache.get(process.env.GUILD_ID ?? "");
  if (!guild) return;
  const reportsChannel = (await guild?.channels.cache
    .get(process.env.REPORT_CHANNEL_ID ?? "")
    ?.fetch()) as Channel;
  if (!reportsChannel.isText()) return;
  const logsChannel = (await guild?.channels.cache
    .get(process.env.LOGS_CHANNEL_ID ?? "")
    ?.fetch()) as Channel;
  if (!logsChannel.isText()) return;
  const deathsChannel = (await guild?.channels.cache
    .get(process.env.DEATHS_CHANNEL_ID ?? "")
    ?.fetch()) as Channel;
  if (!deathsChannel.isText()) return;
  setInterval(async () => {
    await prepareGetMember(guild);
    const events = await getEvents();
    events.forEach((event) => {
      if (event.type === "report") {
        const member = guild?.members.cache.get(event.user);

        const embed = new MessageEmbed()
          .setTitle("Report")
          .setColor("#ff0000")
          .addField("Gracz", `${member?.user?.tag}`)
          .addField("Treść", event.data);
        reportsChannel.send({ content: "@here", embeds: [embed] });
      } else if (event.type === "log") {
        const embed = new MessageEmbed()
          .setTitle((event.data as string).charAt(0).toUpperCase() + event.data.slice(1))
          .setColor("#ff0000")
          .addField("Gracz", event.user)
          .setFooter(new Date(event.timestamp).toLocaleString());
        logsChannel.send({ embeds: [embed] });
      } else if (event.type === "death") {
        const embed = new MessageEmbed()
          .setTitle("Log śmierci")
          .setColor("#ff0000")
          .addField("Gracz", event.user)
          .addField("Powód śmierci", event.data.damageCause)
          .addField("Komunikat o śmierci", event.data.deathMessage);

        if (event.data.killerType) embed.addField("Rodzaj zabójcy", event.data.killerType);
        if (event.data.killerName) embed.addField("Nazwa zabójcy", event.data.killerName);

        deathsChannel.send({ embeds: [embed] });
      }
    });
  }, 10 * 1000);
};
