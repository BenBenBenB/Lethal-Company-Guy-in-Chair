import { Player } from "../types/player";

export const adaptPlayerListFromLocalStorage = (
  storedPlayerList: string
): Player[] => {
  return JSON.parse(storedPlayerList);
};

export const adaptPlayerListToLocalStorage = (playerList: Player[]): string => {
  return JSON.stringify(playerList);
};
