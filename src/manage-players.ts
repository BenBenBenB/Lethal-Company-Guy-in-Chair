import { HOTKEYS } from "./constants/hotkeys";
import { MAX_PLAYERS } from "./constants/settings";
import playerListContext, { type PlayerListContext } from "./context/player";
import DB from "./db/db";
import { DataBase } from "./types/db";
import { HotKeys } from "./types/hotkeys";
import { Player } from "./types/player";
import {
  getCheckboxId,
  getHotkeyId,
  getNameFieldId,
  saveToClipboard,
  toggleAllCheckboxes,
} from "./utils/dom-helpers";

const setPlayerList = (
  playerList: Player[],
  playerListContext: PlayerListContext
) => {
  playerList.forEach((player: Player) => {
    const textbox = <HTMLInputElement>(
      document.getElementById(getNameFieldId(player.rowIndex))
    );
    const checkbox = <HTMLInputElement>(
      document.getElementById(getCheckboxId(player.rowIndex))
    );
    textbox.value = player.name || "";
    checkbox.checked = player.checked;
  });

  playerListContext.setPlayerList(playerList);
};

const createPlayerRow = (
  player: Player,
  DB: DataBase,
  playerListContext: PlayerListContext
): HTMLTableRowElement => {
  const { hotkey, rowIndex } = player;
  const row = document.createElement("tr");
  row.innerHTML = `
            <td>${rowIndex + 1}.</td>
            <td><input type="checkbox" id="${getCheckboxId(
              rowIndex
            )}" title="Check to include in camera view." checked=${
    player.checked
  }></td>
            <td><input type="text" id="${getNameFieldId(rowIndex)}"></td>
            <td><input id="${getHotkeyId(
              rowIndex
            )}" title="Hotkey for swapping to this player." value=${
    hotkey ?? (HOTKEYS[rowIndex] || "")
  }></td>
        `;
  const checkbox = <HTMLInputElement>(
    row.querySelector(`#${getCheckboxId(rowIndex)}`)
  );
  const textbox = <HTMLInputElement>(
    row.querySelector(`#${getNameFieldId(rowIndex)}`)
  );
  const hotkeyTextBox = <HTMLInputElement>(
    row.querySelector(`#${getHotkeyId(rowIndex)}`)
  );

  checkbox.addEventListener("change", () => {
    playerListContext.set({
      ...player,
      checked: checkbox.checked,
    });
  });
  textbox.addEventListener("keyup", (event: KeyboardEvent) => {
    const name = (<HTMLInputElement>event.target).value;
    checkbox.checked = name.trim() !== "";
    playerListContext.set({
      ...player,
      name,
      checked: checkbox.checked,
    });
  });
  hotkeyTextBox.addEventListener("keyup", (event: KeyboardEvent) => {
    playerListContext.set({
      ...player,
      hotkey: (<HTMLInputElement>event.target).value as HotKeys,
    });
  });

  return row;
};

const setUpList = async (
  DB: DataBase,
  playerListContext: PlayerListContext
) => {
  const list = <HTMLTableElement>document.getElementById("player_table_body");
  const playerList = playerListContext.playerList();
  playerList.forEach((player: Player) =>
    list.appendChild(createPlayerRow(player, DB, playerListContext))
  );

  // Finish setting other rows up
  for (let i = playerList.length; i < MAX_PLAYERS; i++) {
    list.appendChild(
      createPlayerRow(
        { name: "", rowIndex: i, checked: false },
        DB,
        playerListContext
      )
    );
  }

  setPlayerList(playerList, playerListContext);
  await saveToClipboard(playerListContext);
};

const setUpButtons = (DB: DataBase, playerListContext: PlayerListContext) => {
  (<HTMLInputElement>document.getElementById("cb_toggle_all")).addEventListener(
    "click",
    (event: MouseEvent) => {
      toggleAllCheckboxes(
        (<HTMLInputElement>event.target).checked,
        playerListContext
      );
    }
  );
  (<HTMLButtonElement>(
    document.getElementById("btn_clear_names")
  )).addEventListener("click", () =>
    setPlayerList(
      Array(MAX_PLAYERS).fill((index: number) => ({
        name: "",
        rowIndex: index,
      })),
      playerListContext
    )
  );
  (<HTMLButtonElement>document.getElementById("btn_copy_to")).addEventListener(
    "click",
    () => saveToClipboard(playerListContext)
  );
};

const main = (db: DataBase, playerListContext: PlayerListContext) => {
  playerListContext.subscribe(() => saveToClipboard(playerListContext));

  document.addEventListener("DOMContentLoaded", async () => {
    await setUpList(db, playerListContext);
    setUpButtons(db, playerListContext);
  });
};

main(DB, playerListContext);

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
