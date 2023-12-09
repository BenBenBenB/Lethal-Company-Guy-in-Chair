import { HotKeys } from "./hotkeys";

export type Player = {
  name: string;
  rowIndex: number;
  checked: boolean; // checked === !ignored
  hotkey?: HotKeys;
};
