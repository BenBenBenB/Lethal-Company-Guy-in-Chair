import { PlayerRow } from "../../src/components/playerRow/player-row";
import { Player } from "../../src/types/player";
import { getRowId } from "../../src/utils/dom-helpers";

export const generatePlayerRows = (players: Player[]): string => {
  let body = "";
  players.forEach((player: Player) => {
    body += `<tr id=${getRowId(player.rowIndex)} >${PlayerRow(player)}</tr>`;
  });
  return body;
};
