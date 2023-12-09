import { HOTKEYS } from "../../constants/hotkeys";
import { getCheckboxId, getNameFieldId } from "../../manage-players";
import { Player } from "../../types/player";
import { getHotkeyId } from "../../utils/dom-helpers";

export const PlayerRow = (player: Player): string => `
              <td>${player.rowIndex + 1}.</td>
              <td><input type="checkbox" id="${getCheckboxId(
                player.rowIndex
              )}" title="Check to include in camera view." ${
  player.checked ? "checked" : ""
}></td>
              <td><input type="text" id="${getNameFieldId(
                player.rowIndex
              )}" value="${player.name}"></td>
              <td><input id="${getHotkeyId(
                player.rowIndex
              )}" title="Hotkey for swapping to this player." value="${
  player.hotkey ?? (HOTKEYS[player.rowIndex] || "")
}"></td>`;
