import DB from "./db/db";
import { DataBase } from "./types/db";

const MAX_PLAYERS = 12;
const IGNORE_PREFIX = "IGNOREDPLAYER:";
const INITIAL_PLAYERS = ["Old Yeller", "murmuring.witch"];
const HOTKEYS = ["F1", "F2"];

const getNameFieldId = (index: number): string => `player${index}_name`;
const getCheckboxId = (index: number): string => `player${index}_cb`;

const setPlayerList = (nameArray: string[]) => {
  nameArray.forEach((name: string, i: number) => {
    const textbox = <HTMLInputElement>(
      document.getElementById(getNameFieldId(i))
    );
    const checkbox = <HTMLInputElement>(
      document.getElementById(getCheckboxId(i))
    );
    textbox.value = name || "";
    checkbox.checked = !!name.trim(); // Check the box if the name is not empty
  });

  // TODO: Move this to db
  localStorage.setItem("playerList", nameArray.join(","));
};

const saveToClipboard = async () => {
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

  localStorage.setItem("playerList", textToSave.replace("\n", ","));

  await navigator.clipboard.writeText(textToSave);
};

const createPlayerRow = (i: number): HTMLTableRowElement => {
  const row = document.createElement("tr");
  row.innerHTML = `
            <td>${i + 1}.</td>
            <td><input type="checkbox" id="${getCheckboxId(
              i
            )}" title="Check to include in camera view."></td>
            <td><input type="text" id="${getNameFieldId(i)}"></td>
            <td><b title="Hotkey for swapping to this player.">${
              HOTKEYS[i] || ""
            }</b></td>
        `;
  const checkbox = <HTMLInputElement>row.querySelector(`#${getCheckboxId(i)}`);
  const textbox = <HTMLInputElement>row.querySelector(`#${getNameFieldId(i)}`);

  checkbox.addEventListener("change", saveToClipboard);
  textbox.addEventListener("keyup", async (event: KeyboardEvent) => {
    checkbox.checked = (<HTMLInputElement>event.target).value.trim() !== "";
    await saveToClipboard();
  });

  // Uncheck the checkbox if the textbox is empty
  if (!textbox.value.trim()) {
    checkbox.checked = false;
  }

  return row;
};

const setUpList = async (playerList: string[] = []) => {
  const list = <HTMLTableElement>document.getElementById("player_table_body");
  Array.from({ length: MAX_PLAYERS }, (_, i) => createPlayerRow(i)).forEach(
    (row) => list.appendChild(row)
  );
  setPlayerList(playerList);
  await saveToClipboard();
};

const toggleAllCheckboxes = async (check: boolean): Promise<void> => {
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
  await saveToClipboard();
};

const setUpButtons = () => {
  (<HTMLInputElement>document.getElementById("cb_toggle_all")).addEventListener(
    "click",
    (event: MouseEvent) => {
      toggleAllCheckboxes((<HTMLInputElement>event.target).checked);
    }
  );
  (<HTMLButtonElement>(
    document.getElementById("btn_clear_names")
  )).addEventListener("click", () =>
    setPlayerList(Array(MAX_PLAYERS).fill(""))
  );
  (<HTMLButtonElement>document.getElementById("btn_copy_to")).addEventListener(
    "click",
    saveToClipboard
  );
};

const writeToCache = (key: string, write: unknown) => {};

const main = (DB: DataBase) => {
  const { playerList } = DB.getAllData();

  document.addEventListener("DOMContentLoaded", async () => {
    if (playerList.length !== 0) {
      await setUpList(playerList.split(","));
    } else {
      await setUpList();
    }
    setUpButtons();
  });
};

main(DB);

export {
  HOTKEYS,
  INITIAL_PLAYERS,
  MAX_PLAYERS,
  createPlayerRow,
  getCheckboxId,
  getNameFieldId,
  main,
  saveToClipboard,
  setPlayerList,
  setUpButtons,
  setUpList,
  toggleAllCheckboxes,
};
