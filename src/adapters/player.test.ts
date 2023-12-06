import { HotKeys } from "../types/hotkeys";
import { Player } from "../types/player";
import {
  adaptPlayerListFromLocalStorage,
  adaptPlayerListToLocalStorage,
} from "./player";

describe("", () => {
  it("should convert playerList to expected string", () => {
    const expected =
      '[{"name":"ben","hotkey":"F1"},{"name":"ryan","hotkey":"F2"}]';
    const playerList = [
      {
        name: "ben",
        hotkey: HotKeys.F1,
      },
      {
        name: "ryan",
        hotkey: HotKeys.F2,
      },
    ] as Player[];

    const result = adaptPlayerListToLocalStorage(playerList);

    expect(result).toBe(expected);
  });
  it("should convert stored string to expected list of Player objects", () => {
    const expected = [
      {
        name: "ben",
        hotkey: HotKeys.F1,
      },
      {
        name: "ryan",
        hotkey: HotKeys.F2,
      },
    ] as Player[];
    const playerListString =
      '[{"name":"ben","hotkey":"F1"},{"name":"ryan","hotkey":"F2"}]';

    const result = adaptPlayerListFromLocalStorage(playerListString);

    expect(result).toStrictEqual(expected);
  });
});
