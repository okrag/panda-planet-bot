import { Client, MessageEmbed } from "discord.js";
import { getGuild } from "./getGuild";
import { getTextChannels } from "./getTextChannel";
import { EventHandler } from "./minecraftConnection";
import { damageCauseTranslations, entityTypesTranslations } from "./minecraftTypes";
import { removeFormatting } from "./removeFormatting";

export class EventManager {
  public static eventHandler: EventHandler;
  static async setup(client: Client) {
    const guild = getGuild(client);
    if (!guild) return;

    const [reportsChannel, logsChannel, deathsChannel, testsChannel] = await getTextChannels(
      guild,
      process.env.REPORT_CHANNEL_ID,
      process.env.LOGS_CHANNEL_ID,
      process.env.DEATHS_CHANNEL_ID,
      process.env.TESTS_CHANNEL_ID,
    );

    if (!reportsChannel || !logsChannel || !deathsChannel || !testsChannel) return;

    this.eventHandler = new EventHandler(10 * 1000, guild);

    this.eventHandler.on("report", (event) => {
      const member = guild.members.cache.get(event.user);
      if (!member) return;

      const embed = new MessageEmbed()
        .setTitle("Report")
        .setColor("#ff0000")
        .addField("Gracz", member.user.tag)
        .addField("Treść", event.data)
        .setFooter(new Date(event.timestamp).toLocaleString("pl"));
      reportsChannel.send({ content: "@here", embeds: [embed] });
    });

    this.eventHandler.on("log", (event) => {
      const embed = new MessageEmbed()
        .setTitle(event.data.charAt(0).toUpperCase() + event.data.slice(1).toLowerCase())
        .setColor("#ff0000")
        .addField("Gracz", removeFormatting(event.user))
        .setFooter(new Date(event.timestamp).toLocaleString("pl"));
      logsChannel.send({ embeds: [embed] });
    });

    this.eventHandler.on("death", (event) => {
      const embed = new MessageEmbed()
        .setTitle("Log śmierci")
        .setColor("#ff0000")
        .addField("Gracz", removeFormatting(event.user))
        .addField("Powód śmierci", damageCauseTranslations(event.data.damageCause))
        .addField("Komunikat o śmierci", removeFormatting(event.data.deathMessage))
        .setFooter(new Date(event.timestamp).toLocaleString("pl"));

      if (event.data.killerType)
        embed.addField("Rodzaj zabójcy", entityTypesTranslations(event.data.killerType));
      if (event.data.killerName)
        embed.addField("Nazwa zabójcy", removeFormatting(event.data.killerName));

      deathsChannel.send({ embeds: [embed] });
    });
    this.eventHandler.on("test", (event) => {
      const embed = new MessageEmbed()
        .setTitle("Log testu")
        .setColor("#ff0000")
        .addField("Twórca", removeFormatting(event.user))
        .addField("Nazwa", event.data.name)
        .addField("Testowane na", event.data.subject)
        .addField("Start", new Date(event.data.start).toLocaleString("pl"))
        .addField("Koniec", new Date(event.data.end).toLocaleString("pl"))
        .addField("Id", event.data.id)
        .setFooter(new Date(event.timestamp).toLocaleString("pl"));

      testsChannel.send({ embeds: [embed] });
    });
  }
}
