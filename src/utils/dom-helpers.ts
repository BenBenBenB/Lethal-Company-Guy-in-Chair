import { HOTKEYS } from "../constants/hotkeys";
import { IGNORE_PREFIX } from "../constants/settings";
import { PlayerListContext } from "../context/player";
import { DataBase } from "../types/db";
import { Player } from "../types/player";

export const getNameFieldId = (index: number): string => `player${index}_name`;
export const getCheckboxId = (index: number): string => `player${index}_cb`;
export const getHotkeyId = (index: number): string => `player${index}_hk`;

export const saveToClipboard = async (playerListContext: PlayerListContext) => {
  const textToSave = playerListContext
    .playerList()
    .map(
      (player: Player) =>
        player.name &&
        (player.checked ? player.name : `${IGNORE_PREFIX}${player.name}`)
    )
    .filter(Boolean)
    .join("\n");

  await navigator.clipboard.writeText(textToSave);
};

export const toggleAllCheckboxes = async (
  check: boolean,
  playerListContext: PlayerListContext
): Promise<void> => {
  console.log("here");
  const updatedPlayerList = playerListContext
    .playerList()
    .map((player: Player): Player => {
      const checkbox = <HTMLInputElement>(
        document.getElementById(getCheckboxId(player.rowIndex))
      );
      const textbox = <HTMLInputElement>(
        document.getElementById(getNameFieldId(player.rowIndex))
      );
      if (check) {
        checkbox.checked = textbox.value.trim() !== "";
      } else {
        checkbox.checked = false;
      }
      return { ...player, checked: checkbox.checked };
    });

  playerListContext.setPlayerList(updatedPlayerList);
};

export const fetchHotkeyById = (index: number, DB: DataBase): string =>
  DB.get(getHotkeyId(index)) || HOTKEYS[index] || "";
