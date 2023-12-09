import { mockPlayers } from "../../tests/mocks/players";
import { adaptPlayerListFromLocalStorage } from "../adapters/player";
import { MAX_PLAYERS } from "../constants/settings";
import DB from "../db/db";
import { Player } from "../types/player";
import { Subscriber } from "../types/subscriber";
import { PlayerListContext } from "./player";

describe("Test PlayerContext", () => {
  let playerContext: PlayerListContext;

  beforeEach(() => {
    playerContext = PlayerListContext.getInstance(DB);
  });

  afterEach(() => {
    playerContext.resetState();
  });

  it("Should return a singleton", () => {
    const playerContext2 = PlayerListContext.getInstance(DB);
    expect(playerContext).toBe(playerContext2);
  });

  it("Should give blank initial data of size MAX_PLAYERS and set in localStorage", () => {
    expect(playerContext.playerList().length).toBe(MAX_PLAYERS);

    playerContext.playerList().forEach((player: Player, index: number) => {
      expect(player).toStrictEqual({
        name: "",
        rowIndex: index,
        checked: false,
      });
    });

    const data = adaptPlayerListFromLocalStorage(DB.get("playerList")!);
    expect(data).toStrictEqual(playerContext.playerList());
  });

  it("Should set the player list but maintain the length", () => {
    const expected = [
      ...mockPlayers,
      ...Array.from(
        { length: MAX_PLAYERS - mockPlayers.length },
        (_, index) => ({
          name: "",
          rowIndex: index + mockPlayers.length,
          checked: false,
        })
      ),
    ];
    playerContext.setPlayerList(mockPlayers);
    const players = playerContext.playerList();

    expect(players).toStrictEqual(expected);

    const data = adaptPlayerListFromLocalStorage(DB.get("playerList")!);

    expect(data).toStrictEqual(expected);
  });

  it("Should notify subscribers of changes", () => {
    const listener = jest.fn();
    playerContext.subscribe({ name: "test", listener });
    playerContext.set({ name: "lil pump", checked: true, rowIndex: -1 });
    expect(listener).toHaveBeenCalled();
  });

  it("Should return requested player", () => {
    const expected = mockPlayers[0];
    playerContext.set(expected);
    const result = playerContext.get(expected.name);

    expect(result).toStrictEqual(expected);
  });

  it("Should return null", () => {
    const result = playerContext.get("def does not exist");

    expect(result).toBeNull();
  });

  it("Should unsubscribe", () => {
    const testSubscriber = { name: "test", listener: () => {} };
    playerContext.subscribe(testSubscriber);
    expect(
      playerContext
        .getSubscribers()
        .find(
          (subscriber: Subscriber) => subscriber.name === testSubscriber.name
        )
    ).toStrictEqual(testSubscriber);

    playerContext.unsubscribe(testSubscriber.name);
    expect(
      playerContext
        .getSubscribers()
        .find(
          (subscriber: Subscriber) => subscriber.name === testSubscriber.name
        )
    ).toBeUndefined();
  });

  it("Should refresh state", () => {
    const expected = Array.from({ length: MAX_PLAYERS }, (_, index) => ({
      name: "",
      rowIndex: index,
      checked: false,
    }));

    playerContext.resetState();

    expect(playerContext.getSubscribers()).toStrictEqual([]);
    expect(playerContext.playerList()).toStrictEqual(expected);

    const data = adaptPlayerListFromLocalStorage(DB.get("playerList")!);
    expect(data).toStrictEqual(expected);
  });
});
