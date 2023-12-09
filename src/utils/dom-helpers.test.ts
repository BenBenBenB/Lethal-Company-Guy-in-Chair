import { localStorageMock } from "../../tests/mocks/local-storage";
import { mockPlayers } from "../../tests/mocks/players";
import { generatePlayerRows } from "../../tests/utils/manage-players.utils";
import { IGNORE_PREFIX } from "../constants/settings";
import { PlayerListContext } from "../context/player";
import DB from "../db/db";
import { initSubscriptions, setUpList } from "../manage-players";
import { Player } from "../types/player";
import {
  fetchHotkeyById,
  getCheckboxId,
  getHotkeyId,
  getNameFieldId,
  getRowId,
  saveToClipboard,
  toggleAllCheckboxes,
} from "./dom-helpers";

describe("Tests for getting IDs", () => {
  it("Should return name field IDs", () => {
    const playerId = 0;
    const expected = "player0_name";
    const result = getNameFieldId(playerId);
    expect(result).toBe(expected);
  });

  it("Should return checkbox ID", () => {
    const playerId = 0;
    const expected = "player0_cb";
    const result = getCheckboxId(playerId);
    expect(result).toBe(expected);
  });

  it("Should return hotkey ID", () => {
    const playerId = 0;
    const expected = "player0_hk";
    const result = getHotkeyId(playerId);
    expect(result).toBe(expected);
  });

  it("Should return row ID", () => {
    const playerId = 0;
    const expected = "player0_row";
    const result = getRowId(playerId);
    expect(result).toBe(expected);
  });
});

describe("Save to clipboard", () => {
  let playerContext: PlayerListContext;
  beforeEach(() => {
    playerContext = PlayerListContext.getInstance(DB);
    //@ts-ignore
    global.navigator.clipboard = {
      writeText: jest.fn().mockResolvedValue(undefined),
    };
    document.body.innerHTML = `
        <table>
            <tbody id="player_table_body"></tbody>
        </table>
    `;
    const players = [
      ...mockPlayers,
      { name: "ignore me", rowIndex: 6, checked: false },
    ];
    playerContext.setPlayerList(players);
  });

  afterEach(() => {
    playerContext.resetState();
    localStorageMock.clear();
  });

  it("should save values to clipboard", async () => {
    const expected = "Ben\nRyan\nCaleb\nJeff\nIGNOREDPLAYER:ignore me";
    setUpList(playerContext);
    const ignoredCheckbox = <HTMLInputElement>(
      document.querySelector(
        `#${getCheckboxId(playerContext.get("ignore me")?.rowIndex || -1)}`
      )
    );
    // Manually un-check checkbox for "ignore me" player
    ignoredCheckbox.checked = false;
    await saveToClipboard(playerContext);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expected);
  });
});

describe("Test toggle all checkboxes", () => {
  let playerContext: PlayerListContext;
  beforeEach(() => {
    playerContext = PlayerListContext.getInstance(DB);
    //@ts-ignore
    global.navigator.clipboard = {
      writeText: jest.fn().mockResolvedValue(undefined),
    };
    playerContext.setPlayerList(mockPlayers);
    document.body.innerHTML = `
      <div>
      ${generatePlayerRows(playerContext.playerList())}
      </div>
    `;
  });

  afterEach(() => {
    localStorageMock.clear();
    playerContext.resetState();
  });

  it("Should Toggle All Checkboxes on and save results to clipboard", () => {
    const expected = playerContext
      .playerList()
      .map((player: Player): string => player.name)
      .filter((name: string): boolean => name !== "")
      .join("\n");
    initSubscriptions(playerContext);
    toggleAllCheckboxes(true, playerContext);
    playerContext.playerList().forEach((player: Player) => {
      const checkbox = <HTMLInputElement>(
        document.querySelector(`#${getCheckboxId(player.rowIndex)}`)
      );
      if (player.name !== "") {
        expect(checkbox.checked).toBe(true);
      }
    });
    const checkbox = <HTMLInputElement>(
      document.querySelector(`#${getCheckboxId(5)}`)
    );
    // The 5th entry in the `players` array is blank
    expect(checkbox.checked).toBe(false);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expected);
  });

  it("Should Toggle All Checkboxes off and save results to clipboard", () => {
    const expected = playerContext
      .playerList()
      .filter((player: Player): boolean => player.name !== "")
      .map((player: Player): string => `${IGNORE_PREFIX}${player.name}`)
      .join("\n");
    initSubscriptions(playerContext);
    toggleAllCheckboxes(false, playerContext);
    for (let i = 0; i < 5; i++) {
      const checkbox = <HTMLInputElement>(
        document.querySelector(`#${getCheckboxId(i)}`)
      );
      expect(checkbox.checked).toBe(false);
    }
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expected);
  });
});

describe("Test fetching a hotkey", () => {
  let playerContext: PlayerListContext;
  beforeEach(() => {
    playerContext = PlayerListContext.getInstance(DB);
  });

  afterEach(() => {
    playerContext.resetState();
    localStorageMock.clear();
  });

  it("should fetch hotkey", () => {
    const testId = 0;
    const expected = "F3";
    DB.write(`player${testId}_hk`, expected);
    const result = fetchHotkeyById(testId, DB);
    expect(result).toBe(expected);
  });

  it("should get a default key", () => {
    const testId = 0;
    const expected = "F1";
    const result = fetchHotkeyById(testId, DB);
    expect(result).toBe(expected);
  });

  it("should get an empty string", () => {
    const testId = -1;
    const expected = "";
    const result = fetchHotkeyById(testId, DB);
    expect(result).toBe(expected);
  });
});

describe("Test toggle table header checkbox", () => {
  let playerContext: PlayerListContext;
  beforeEach(() => {
    playerContext = PlayerListContext.getInstance(DB);
    //@ts-ignore
    global.navigator.clipboard = {
      writeText: jest.fn().mockResolvedValue(undefined),
    };
    playerContext.setPlayerList(mockPlayers);
    document.body.innerHTML = `
      <table>
          <thead>
              <th>#</th>
              <th><input type="checkbox" id="cb_toggle_all" checked="true" title="Toggle All" /></th>
              <th>Player Name</th>
              <th>HotKey Assignment</th>
          </thead>
          <tbody id="player_table_body"></tbody>
      </table>
    `;
  });

  afterEach(() => {
    localStorageMock.clear();
    playerContext.resetState();
  });

  it("Should toggle checkbox off", () => {
    setUpList(playerContext);
    let checkbox = <HTMLInputElement>document.getElementById("cb_toggle_all");
    expect(checkbox.checked).toBe(true);

    const rowCheckbox = <HTMLInputElement>(
      document.getElementById(
        `${getCheckboxId(playerContext.playerList()[0].rowIndex)}`
      )
    );
    expect(rowCheckbox.checked).toBe(true);
    rowCheckbox.click();
    expect(rowCheckbox.checked).toBe(false);

    checkbox = <HTMLInputElement>document.getElementById("cb_toggle_all");
    expect(checkbox.checked).toBe(false);
  });

  it("Should toggle checkbox on", () => {
    setUpList(playerContext);
    // Same as previous test
    let checkbox = <HTMLInputElement>document.getElementById("cb_toggle_all");
    expect(checkbox.checked).toBe(true);

    const rowCheckbox = <HTMLInputElement>(
      document.getElementById(
        `${getCheckboxId(playerContext.playerList()[0].rowIndex)}`
      )
    );
    expect(rowCheckbox.checked).toBe(true);
    rowCheckbox.click();
    expect(rowCheckbox.checked).toBe(false);

    checkbox = <HTMLInputElement>document.getElementById("cb_toggle_all");
    expect(checkbox.checked).toBe(false);
    //

    rowCheckbox.click();
    expect(rowCheckbox.checked).toBe(true);

    checkbox = <HTMLInputElement>document.getElementById("cb_toggle_all");
    expect(checkbox.checked).toBe(true);
  });
});
