import {
  adaptPlayerListFromLocalStorage,
  adaptPlayerListToLocalStorage,
} from "../adapters/player";
import { MAX_PLAYERS } from "../constants/settings";
import DB from "../db/db";
import { DataBase } from "../types/db";
import { Player } from "../types/player";

type Listener = () => void;

export class PlayerListContext {
  private localStorageKey = "playerList2";
  private static instance: PlayerListContext;
  private data: Player[] = Array.from({ length: MAX_PLAYERS }, (_, index) => ({
    name: "",
    rowIndex: index,
    checked: false,
  }));
  private listeners: Listener[] = [];
  private db: DataBase;

  private constructor(DB: DataBase) {
    this.db = DB;
    const storedPlayerList = this.db.get(this.localStorageKey);
    if (storedPlayerList) {
      this.data = adaptPlayerListFromLocalStorage(storedPlayerList);
    } else {
      this.publishToDB();
    }
  }

  private propagateChanges() {
    this.publishToDB();
    this.notififyListeners();
  }

  private publishToDB() {
    this.db.write(
      this.localStorageKey,
      adaptPlayerListToLocalStorage(this.data)
    );
  }

  public static getInstance(DB: DataBase): PlayerListContext {
    if (!PlayerListContext.instance) {
      PlayerListContext.instance = new PlayerListContext(DB);
    }
    return PlayerListContext.instance;
  }

  public setPlayerList(playerList: Player[]) {
    this.data = playerList;
    this.propagateChanges();
  }

  public set(player: Player) {
    if (player.rowIndex === -1) {
      this.data.push(player);
    } else {
      this.data[player.rowIndex] = player;
    }
    this.propagateChanges();
  }

  public get(name: string): Player | null {
    const player = this.data.find((player: Player) => player.name === name);
    if (player === undefined) {
      return null;
    }
    return this.data[player.rowIndex];
  }

  public playerList(): Player[] {
    return this.data;
  }

  // naive pub-sub
  public subscribe(listener: Listener) {
    this.listeners.push(listener);
  }

  private notififyListeners() {
    this.listeners.forEach((listener) => listener());
  }
}

export default PlayerListContext.getInstance(DB);
