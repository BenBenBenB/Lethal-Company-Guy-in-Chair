import { HOTKEYS } from "./constants/hotkeys";
import { MAX_PLAYERS } from "./constants/settings";
import DB from "./db/db";
import { DataBase } from "./types/db";
import {
  fetchHotkeyById,
  getCheckboxId,
  getHotkeyId,
  getNameFieldId,
  saveToClipboard,
  toggleAllCheckboxes,
} from "./utils/dom-helpers";

const setPlayerList = (nameArray: string[], DB: DataBase) => {
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

  DB.write("playerList", nameArray.join(","));
};

const createPlayerRow = (i: number, DB: DataBase): HTMLTableRowElement => {
  const hotkey = fetchHotkeyById(i, DB);
  const row = document.createElement("tr");
  row.innerHTML = `
            <td>${i + 1}.</td>
            <td><input type="checkbox" id="${getCheckboxId(
              i
            )}" title="Check to include in camera view."></td>
            <td><input type="text" id="${getNameFieldId(i)}"></td>
            <td><input id="${getHotkeyId(
              i
            )}" title="Hotkey for swapping to this player." value=${
    hotkey ? hotkey : HOTKEYS[i] || ""
  }></td>
        `;
  const checkbox = <HTMLInputElement>row.querySelector(`#${getCheckboxId(i)}`);
  const textbox = <HTMLInputElement>row.querySelector(`#${getNameFieldId(i)}`);
  const hotkeyTextBox = <HTMLInputElement>(
    row.querySelector(`#${getHotkeyId(i)}`)
  );

  checkbox.addEventListener("change", () => saveToClipboard(DB));
  textbox.addEventListener("keyup", async (event: KeyboardEvent) => {
    checkbox.checked = (<HTMLInputElement>event.target).value.trim() !== "";
    await saveToClipboard(DB);
  });
  hotkeyTextBox.addEventListener("keyup", async (event: KeyboardEvent) => {
    DB.write(getHotkeyId(i), (<HTMLInputElement>event.target).value);
  });

  // Uncheck the checkbox if the textbox is empty
  if (!textbox.value.trim()) {
    checkbox.checked = false;
  }

  return row;
};

const setUpList = async (DB: DataBase, playerList: string[] = []) => {
  const list = <HTMLTableElement>document.getElementById("player_table_body");
  Array.from({ length: MAX_PLAYERS }, (_, i) => createPlayerRow(i, DB)).forEach(
    (row) => list.appendChild(row)
  );
  setPlayerList(playerList, DB);
  await saveToClipboard(DB);
};

const setUpButtons = (DB: DataBase) => {
  (<HTMLInputElement>document.getElementById("cb_toggle_all")).addEventListener(
    "click",
    (event: MouseEvent) => {
      toggleAllCheckboxes((<HTMLInputElement>event.target).checked, DB);
    }
  );
  (<HTMLButtonElement>(
    document.getElementById("btn_clear_names")
  )).addEventListener("click", () =>
    setPlayerList(Array(MAX_PLAYERS).fill(""), DB)
  );
  (<HTMLButtonElement>document.getElementById("btn_copy_to")).addEventListener(
    "click",
    () => saveToClipboard(DB)
  );
};

const main = (DB: DataBase) => {
  const { playerList } = DB.getAllData();
  console.log(DB.getAllData());

  document.addEventListener("DOMContentLoaded", async () => {
    if (playerList.length === 0) {
      await setUpList(DB);
    } else {
      await setUpList(DB, playerList.split(","));
    }
    setUpButtons(DB);
  });
};

main(DB);

export {
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
