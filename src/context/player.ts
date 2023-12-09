import {
  adaptPlayerListFromLocalStorage,
  adaptPlayerListToLocalStorage,
} from "../adapters/player";
import { MAX_PLAYERS } from "../constants/settings";
import DB from "../db/db";
import { DataBase } from "../types/db";
import { Player } from "../types/player";
import { Subscriber } from "../types/subscriber";

export class PlayerListContext {
  private localStorageKey = "playerList";
  private static instance: PlayerListContext;
  private data: Player[];
  private subscribers: Subscriber[] = [];
  private db: DataBase;

  private constructor(DB: DataBase) {
    this.db = DB;
    const storedPlayerList = this.db.get(this.localStorageKey);
    if (storedPlayerList) {
      this.data = adaptPlayerListFromLocalStorage(storedPlayerList);
    } else {
      this.data = this.getInitialData();
      this.publishToDB();
    }
  }

  private getInitialData(): Player[] {
    return Array.from({ length: MAX_PLAYERS }, (_, index) => ({
      name: "",
      rowIndex: index,
      checked: false,
    }));
  }

  public resetState() {
    this.data = this.getInitialData();
    this.propagateChanges();
    this.subscribers = [];
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
    const playerCount = playerList.length;
    for (let i = 0; i < MAX_PLAYERS; i++) {
      if (i < playerCount) {
        this.data[i] = playerList[i];
      }
    }
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
    return player;
  }

  public playerList(): Player[] {
    return this.data;
  }

  // naive pub-sub
  public subscribe(subscriber: Subscriber) {
    this.subscribers.push(subscriber);
  }

  public unsubscribe(name: string) {
    this.subscribers = this.subscribers.filter(
      (subscriber: Subscriber): boolean => subscriber.name !== name
    );
  }

  private notififyListeners() {
    this.subscribers.forEach((subscriber: Subscriber) => subscriber.listener());
  }

  // This method is really only for testing
  public getSubscribers() {
    return this.subscribers;
  }
}

export default PlayerListContext.getInstance(DB);
