import { generatePlayerRows } from "../../tests/utils/manage-players.utils";
import { MAX_PLAYERS } from "../constants/settings";
import DB from "../db/db";
import { setPlayerList } from "../manage-players";
import {
  fetchHotkeyById,
  getCheckboxId,
  getHotkeyId,
  getNameFieldId,
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
});

describe("Save to clipboard", () => {
  beforeEach(() => {
    //@ts-ignore
    global.navigator.clipboard = {
      writeText: jest.fn().mockResolvedValue(undefined),
    };
    document.body.innerHTML = `
      <div>
      ${generatePlayerRows(12)}
      </div>
    `;
    const players = ["Ben", "Ryan", "Caleb", "Jeff", "ignore me", ""];
    setPlayerList(players, DB);
  });

  it("should save values to clipboard", async () => {
    const expected = "Ben\nRyan\nCaleb\nJeff\nIGNOREDPLAYER:ignore me";
    const ignoredCheckbox = <HTMLInputElement>(
      document.querySelector(`#${getCheckboxId(4)}`)
    );
    // Manually un-check checkbox for "ignore me" player
    ignoredCheckbox.checked = false;
    await saveToClipboard(DB);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expected);
  });
});

describe("Test toggle all checkboxes", () => {
  beforeEach(() => {
    //@ts-ignore
    global.navigator.clipboard = {
      writeText: jest.fn().mockResolvedValue(undefined),
    };
    document.body.innerHTML = `
      <div>
      ${generatePlayerRows(MAX_PLAYERS)}
      </div>
    `;
    const players = ["Ben", "Ryan", "Caleb", "Jeff", ""];
    setPlayerList(players, DB);
  });

  it("Should Toggle All Checkboxes on and save results to clipboard", async () => {
    const expected = "Ben\nRyan\nCaleb\nJeff";
    await toggleAllCheckboxes(true, DB);
    for (let i = 0; i < 4; i++) {
      const checkbox = <HTMLInputElement>(
        document.querySelector(`#${getCheckboxId(i)}`)
      );
      expect(checkbox.checked).toBe(true);
    }
    const checkbox = <HTMLInputElement>(
      document.querySelector(`#${getCheckboxId(5)}`)
    );
    // The 5th entry in the `players` array is blank
    expect(checkbox.checked).toBe(false);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expected);
  });

  it("Should Toggle All Checkboxes off and save results to clipboard", async () => {
    const expected =
      "IGNOREDPLAYER:Ben\nIGNOREDPLAYER:Ryan\nIGNOREDPLAYER:Caleb\nIGNOREDPLAYER:Jeff";
    await toggleAllCheckboxes(false, DB);
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
  beforeEach(() => {
    localStorage.clear();
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
