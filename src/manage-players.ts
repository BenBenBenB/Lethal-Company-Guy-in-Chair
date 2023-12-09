import { PlayerRow } from "./components/playerRow/player-row";
import playerListContext, { type PlayerListContext } from "./context/player";
import { HotKeys } from "./types/hotkeys";
import { Player } from "./types/player";
import { Subscriber } from "./types/subscriber";
import {
  getCheckboxId,
  getHotkeyId,
  getNameFieldId,
  getRowId,
  saveToClipboard,
  toggleAllCheckboxes,
  toggleTableHeaderCheckbox,
} from "./utils/dom-helpers";

const updateRowDataAfterRefresh = (playerListContext: PlayerListContext) => {
  const list = <HTMLTableElement>document.getElementById("player_table_body");
  playerListContext.playerList().forEach((player: Player) => {
    const row = <HTMLTableRowElement>(
      list.querySelector(`#${getRowId(player.rowIndex)}`)
    );
    row.innerHTML = PlayerRow(player);
  });
};

const createPlayerRow = (player: Player): HTMLTableRowElement => {
  const row = document.createElement("tr");
  row.id = getRowId(player.rowIndex);
  row.innerHTML = PlayerRow(player);

  return row;
};

const setUpList = (playerListContext: PlayerListContext) => {
  const list = <HTMLTableElement>document.getElementById("player_table_body");
  const playerList = playerListContext.playerList();
  playerList.forEach((player: Player) => {
    const row = createPlayerRow(player);
    list.appendChild(row);
    setupRow(row, player, playerListContext);
  });
};

const setupRow = (
  row: HTMLTableRowElement,
  player: Player,
  playerListContext: PlayerListContext
) => {
  const checkbox = <HTMLInputElement>(
    row.querySelector(`#${getCheckboxId(player.rowIndex)}`)
  );
  const textbox = <HTMLInputElement>(
    row.querySelector(`#${getNameFieldId(player.rowIndex)}`)
  );
  const hotkeyTextBox = <HTMLInputElement>(
    row.querySelector(`#${getHotkeyId(player.rowIndex)}`)
  );
  checkbox.addEventListener("change", () => {
    playerListContext.set({
      ...player,
      checked: checkbox.checked,
    });
    toggleTableHeaderCheckbox(playerListContext);
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
};

const setUpButtons = (playerListContext: PlayerListContext) => {
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
  )).addEventListener("click", () => {
    playerListContext.resetState();
    updateRowDataAfterRefresh(playerListContext);
  });

  (<HTMLButtonElement>document.getElementById("btn_copy_to")).addEventListener(
    "click",
    () => saveToClipboard(playerListContext)
  );
};

const initSubscriptions = (playerContext: PlayerListContext) => {
  const subscribers = [
    {
      name: saveToClipboard.name,
      listener: () => saveToClipboard(playerContext),
    },
  ];

  subscribers.forEach((subscriber: Subscriber) =>
    playerListContext.subscribe(subscriber)
  );
};

const main = (playerListContext: PlayerListContext) => {
  initSubscriptions(playerListContext);

  document.addEventListener("DOMContentLoaded", () => {
    setUpList(playerListContext);
    setUpButtons(playerListContext);
  });
};

main(playerListContext);

export {
  createPlayerRow,
  getCheckboxId,
  getNameFieldId,
  initSubscriptions,
  main,
  saveToClipboard,
  setUpButtons,
  setUpList,
  setupRow,
  toggleAllCheckboxes,
};
