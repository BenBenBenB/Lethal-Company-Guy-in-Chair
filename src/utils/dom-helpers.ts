import { HOTKEYS } from "../constants/hotkeys";
import { IGNORE_PREFIX } from "../constants/settings";
import { PlayerListContext } from "../context/player";
import { DataBase } from "../types/db";
import { Player } from "../types/player";

export const getRowId = (index: number): string => `player${index}_row`;
export const getNameFieldId = (index: number): string => `player${index}_name`;
export const getCheckboxId = (index: number): string => `player${index}_cb`;
export const getHotkeyId = (index: number): string => `player${index}_hk`;

export const saveToClipboard = async (playerListContext: PlayerListContext) => {
  const textToSave = playerListContext
    .playerList()
    .map(
      (player: Player) =>
        player.name
          ? `${player.checked ? "" : IGNORE_PREFIX}${player.name}`
          : ""
    )
    .join("\n");

  await navigator.clipboard.writeText(textToSave.trimEnd());
};

export const toggleAllCheckboxes = (
  check: boolean,
  playerListContext: PlayerListContext
) => {
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

export const toggleTableHeaderCheckbox = (playerContext: PlayerListContext) => {
  const tableHeaderCheckbox = <HTMLInputElement>(
    document.getElementById("cb_toggle_all")
  );
  const shouldBeChecked = playerContext
    .playerList()
    .filter((player: Player): boolean => player.name !== "")
    .map((player: Player): boolean => player.checked)
    .reduce((isChecked: boolean, checked: boolean) => isChecked && checked);
  tableHeaderCheckbox.checked = shouldBeChecked;
};

export const fetchHotkeyById = (index: number, DB: DataBase): string =>
  DB.get(getHotkeyId(index)) || HOTKEYS[index] || "";
