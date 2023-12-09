import { HotKeys } from "../../src/types/hotkeys";
import { Player } from "../../src/types/player";

export const mockPlayers = [
  { name: "Ben", rowIndex: 0, checked: true, hotkey: HotKeys.F1 },
  { name: "Ryan", rowIndex: 1, checked: true, hotkey: HotKeys.F2 },
  { name: "Caleb", rowIndex: 2, checked: true, hotkey: HotKeys.F3 },
  { name: "Jeff", rowIndex: 3, checked: true },
  { name: "", rowIndex: 4, checked: false },
] as Player[];
