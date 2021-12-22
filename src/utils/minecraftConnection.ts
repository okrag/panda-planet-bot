import * as MinecraftServer from "minecraft-server-util";
import { EventEmitter } from "events";
import TypedEventEmitter from "typed-emitter";
import { Base, Guild } from "discord.js";
import { DamageCause, EntityType } from "./minecraftTypes";
import { v4 as uuid } from "uuid";

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

const RECONNECTION_INTERVAL = 5 * 60 * 1000;

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
    }, RECONNECTION_INTERVAL);
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

export type AnyEvent = LogEvent | ReportEvent | DeathEvent | TestEvent;

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
    damageCause: DamageCause;
    deathMessage: string;
    killerType?: EntityType;
    killerName?: string;
  };
}

export interface TestEvent extends BaseEvent {
  type: "test";
  data: {
    subject: string;
    name: string;
    id: string;
    start: number;
    end: number;
  };
}

export interface BaseEvent {
  id: string;
  type: string;
  data: any;
  user: string;
  timestamp: number;
  needsAcknowledgment: boolean;
}

export interface Events {
  report: (event: ReportEvent) => void;
  log: (event: LogEvent) => void;
  death: (event: DeathEvent) => void;
  test: (event: TestEvent) => void;
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
      const dontNeedAcknowledgment = events.filter((v) => !v.needsAcknowledgment);
      if (dontNeedAcknowledgment.length > 0)
        await Rcon.connection.send(
          "discord_connection_acknowledge " + dontNeedAcknowledgment.map((e) => e.id).join(";"),
        );
      return events;
    } catch (e) {
      return [];
    }
  }

  async sendEvent(
    type: string,
    data: any,
    user: string,
    timestamp: number,
    needsAcknowledgment: boolean,
    callback?: (data: any) => void,
  ) {
    const response = await Rcon.connection.send(
      `discord_connection_send_event ${{
        type,
        data,
        user,
        timestamp,
        needsAcknowledgment,
        id: uuid(),
      }}`,
    );

    callback?.(JSON.parse(response));
  }

  on<E extends keyof Events>(event: E, listener: Events[E]): this {
    super.on(event, async (event: AnyEvent) => {
      const response = await (listener as any)(event);
      if (event.needsAcknowledgment)
        await Rcon.connection.send(
          `discord_connection_acknowledge ${event.id} ${JSON.stringify(response)}`,
        );
    });
    return this;
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
