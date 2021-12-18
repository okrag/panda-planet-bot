import * as MinecraftServer from "minecraft-server-util";
import { EventEmitter } from "events";
import TypedEventEmitter from "typed-emitter";
import { Guild } from "discord.js";

export enum ConnectionResponse {
  SUCCESS,
  NOT_ONLINE,
  ALREADY_CONNECTED,
  ERROR,
}
export enum AcceptConnectionResponse {
  SUCCESS,
  WRONG_CODE,
  ERROR,
}

export class Rcon {
  currentConnection?: MinecraftServer.RCON;
  connectionTimeout!: NodeJS.Timeout;
  private static _instance: Rcon;

  constructor() {
    this.connect();
  }

  async send(cmd: string) {
    if (this.currentConnection) return await this.currentConnection.execute(cmd);
    const rcon = new MinecraftServer.RCON();
    await rcon.connect(process.env.SERVER_IP ?? "", Number(process.env.RCON_PORT ?? "0"));
    await rcon.login(process.env.RCON_PASSWORD ?? "");
    const response = await rcon.execute(cmd);
    await rcon.close();
    return response;
  }

  static get connection() {
    if (!this._instance) this._instance = new Rcon();
    return this._instance;
  }

  async connect() {
    if (this.currentConnection) return this;
    const rcon = new MinecraftServer.RCON();
    await rcon.connect(process.env.SERVER_IP ?? "", Number(process.env.RCON_PORT ?? "0"));
    await rcon.login(process.env.RCON_PASSWORD ?? "");
    this.currentConnection = rcon;
    clearTimeout(this.connectionTimeout);
    this.connectionTimeout = setTimeout(async () => {
      await this.disconnect();
      this.connect();
    }, 1000 * 60);
    return this;
  }
  async disconnect() {
    if (!this.currentConnection) return;
    clearTimeout(this.connectionTimeout);
    await this.currentConnection.close();
    this.currentConnection = undefined;
    return this;
  }
}

export type AnyEvent = LogEvent | ReportEvent | DeathEvent;

export interface LogEvent extends BaseEvent {
  type: "log";
  data: string;
}
export interface ReportEvent extends BaseEvent {
  type: "report";
  data: string;
}
export interface DeathEvent extends BaseEvent {
  type: "death";
  data: {
    damageCause: "";
    deathMessage: string;
    killerType?: "";
    killerName?: string;
  };
}

export interface BaseEvent {
  id: string;
  type: string;
  data: any;
  user: string;
  timestamp: number;
}

export interface Events {
  report: (event: ReportEvent) => void;
  log: (event: LogEvent) => void;
  death: (event: DeathEvent) => void;
}

export const prepareGetMember = async (guild: Guild) => {
  if (guild.members.cache.size === guild.memberCount) return;
  await guild.members.fetch();
};

export class EventHandler extends (EventEmitter as new () => TypedEventEmitter<Events>) {
  private async getEvents() {
    console.log("Fetching events from minecraft server");
    try {
      const events: AnyEvent[] = JSON.parse(
        await Rcon.connection.send("discord_connection_events"),
      );
      await Rcon.connection.send(
        "discord_connection_acknowledge " + events.map((e) => e.id).join(";"),
      );
      return events;
    } catch (e) {
      return [];
    }
  }

  constructor(interval: number, guild: Guild) {
    super();

    setInterval(async () => {
      const events = await this.getEvents();
      for (let i = 0; i < events.length; i++) {
        await prepareGetMember(guild);
        this.emit(events[i].type, events[i] as any);
      }
    }, interval);
  }
}

export const getStatus = () =>
  MinecraftServer.status(process.env.SERVER_IP ?? "", Number(process.env.SERVER_PORT), {
    timeout: 2 * 1000 + 500,
  });