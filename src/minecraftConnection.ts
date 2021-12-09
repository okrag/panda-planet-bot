import * as MinecraftServer from "minecraft-server-util";

export const userMap = new Map<string, string>();

export enum ConnectionResponse {
  SUCCESS,
  NOT_ONLINE,
  ERROR,
}
export enum AcceptConnectionResponse {
  SUCCESS,
  WRONG_CODE,
  ERROR,
}

export const send = async (cmd: string) => {
  const rcon = new MinecraftServer.RCON();
  await rcon.connect(process.env.SERVER_IP ?? "", Number(process.env.SERVER_PORT ?? "0"));
  await rcon.login(process.env.RCON_PASSWORD ?? "");
  const response = await rcon.execute(cmd);
  await rcon.close();
  return response;
};

export const connect = async (nick: string) => {
  try {
    return Number(await send("discord_connection " + nick)) as ConnectionResponse;
  } catch (e) {
    return ConnectionResponse.ERROR;
  }
};

export const acceptConnection = async (nick: string, code: string, discordId: string) => {
  try {
    const response = Number(
      await send(`discord_connection_accept ${nick} ${code} ${discordId}`),
    ) as AcceptConnectionResponse;
    if (response === AcceptConnectionResponse.SUCCESS) {
      userMap.set(discordId, nick);
    }
    return response;
  } catch (e) {
    return AcceptConnectionResponse.ERROR;
  }
};

export const getStatus = () =>
  MinecraftServer.status(process.env.SERVER_IP ?? "", Number(process.env.SERVER_PORT), {
    timeout: 2 * 1000 + 500,
  });
