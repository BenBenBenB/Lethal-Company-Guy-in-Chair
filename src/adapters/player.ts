import { Player } from "../types/player";

export const adaptPlayerListFromLocalStorage = (
  storedPlayerList: string
): Player[] => JSON.parse(storedPlayerList);

export const adaptPlayerListToLocalStorage = (playerList: Player[]): string =>
  JSON.stringify(playerList);
