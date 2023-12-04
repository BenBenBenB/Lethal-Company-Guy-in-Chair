import { HOTKEYS } from "../constants/hotkeys";
import { IGNORE_PREFIX, MAX_PLAYERS } from "../constants/settings";
import { DataBase } from "../types/db";

export const getNameFieldId = (index: number): string => `player${index}_name`;
export const getCheckboxId = (index: number): string => `player${index}_cb`;
export const getHotkeyId = (index: number): string => `player${index}_hk`;

export const saveToClipboard = async (DB: DataBase) => {
  const textToSave = Array.from({ length: MAX_PLAYERS }, (_, i): string => {
    const checkbox = <HTMLInputElement>(
      document.getElementById(getCheckboxId(i))
    );
    const playerName = (<HTMLInputElement>(
      document.getElementById(getNameFieldId(i))
    )).value.trim();
    return (
      playerName &&
      (checkbox.checked ? playerName : `${IGNORE_PREFIX}${playerName}`)
    );
  })
    .filter(Boolean)
    .join("\n");

  // TODO: Move this to manage-players
  DB.write("playerList", textToSave.replace("\n", ","));

  await navigator.clipboard.writeText(textToSave);
};

export const toggleAllCheckboxes = async (
  check: boolean,
  DB: DataBase
): Promise<void> => {
  Array.from({ length: MAX_PLAYERS }, (_, i) => {
    const checkbox = <HTMLInputElement>(
      document.getElementById(getCheckboxId(i))
    );
    const textbox = <HTMLInputElement>(
      document.getElementById(getNameFieldId(i))
    );
    if (check) {
      checkbox.checked = textbox.value.trim() !== "";
    } else {
      checkbox.checked = false;
    }
  });
  await saveToClipboard(DB);
};

export const fetchHotkeyById = (index: number, DB: DataBase): string =>
  DB.get(getHotkeyId(index)) || HOTKEYS[index] || "";
