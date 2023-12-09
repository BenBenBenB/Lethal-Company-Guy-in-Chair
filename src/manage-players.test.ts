import { localStorageMock } from "../tests/mocks/local-storage";
import { mockPlayers } from "../tests/mocks/players";
import { generatePlayerRows } from "../tests/utils/manage-players.utils";
import { MAX_PLAYERS } from "./constants/settings";
import { PlayerListContext } from "./context/player";
import DB from "./db/db";
import {
  createPlayerRow,
  initSubscriptions,
  main,
  setUpButtons,
  setUpList,
} from "./manage-players";
import { Player } from "./types/player";
import {
  getCheckboxId,
  getHotkeyId,
  getNameFieldId,
  getRowId,
} from "./utils/dom-helpers";

describe("Test create player row", () => {
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
          <tbody id="player_table_body"></tbody>
      </table>
    `;
  });
  afterEach(() => {
    playerContext.resetState();
    localStorageMock.clear();
  });

  it("Should create player row with hotkey", () => {
    const player = mockPlayers[0];
    const row = createPlayerRow(player);

    expect(row.tagName).toBe("TR");

    const checkbox = <HTMLInputElement>(
      row.querySelector(`#${getCheckboxId(player.rowIndex)}`)
    );
    const textbox = <HTMLInputElement>(
      row.querySelector(`#${getNameFieldId(player.rowIndex)}`)
    );
    expect(checkbox).not.toBeNull();
    expect(textbox).not.toBeNull();

    expect(checkbox.checked).toBe(player.checked);

    const hotkey = (<HTMLInputElement>(
      row.querySelector(`#${getHotkeyId(player.rowIndex)}`)
    )).value;
    expect(hotkey).toBe(player.hotkey);
  });

  it("Should create player row with no hotkey", () => {
    const player = mockPlayers[3];
    const row = createPlayerRow(player);
    const hotkey = (<HTMLInputElement>(
      row.querySelector(`#${getHotkeyId(player.rowIndex)}`)
    )).value;
    expect(hotkey).toBe("");
  });

  it("Should check the checkbox when text is entered in the textbox", () => {
    const player = mockPlayers[4];
    initSubscriptions(playerContext);
    setUpList(playerContext);
    const row = <HTMLTableRowElement>(
      document.getElementById(getRowId(player.rowIndex))
    );
    const checkbox = <HTMLInputElement>(
      row.querySelector(`#${getCheckboxId(player.rowIndex)}`)
    );
    const textbox = <HTMLInputElement>(
      row.querySelector(`#${getNameFieldId(player.rowIndex)}`)
    );
    const expected = "Ben\nRyan\nCaleb\nJeff\nPlayer Name";

    textbox.value = "Player Name";
    textbox.dispatchEvent(new Event("keyup"));

    expect(checkbox.checked).toBe(true);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expected);
  });
});

describe("Test setup list", () => {
  let playerContext: PlayerListContext;
  beforeEach(() => {
    playerContext = PlayerListContext.getInstance(DB);
    document.body.innerHTML = `
        <table>
            <tbody id="player_table_body"></tbody>
        </table>
    `;
    //@ts-ignore
    global.navigator.clipboard = {
      writeText: jest.fn().mockResolvedValue(undefined),
    };
    playerContext.setPlayerList(mockPlayers);
  });
  afterEach(() => {
    playerContext.resetState();
    localStorageMock.clear();
  });

  it("should populate the player list with the correct number of players", () => {
    setUpList(playerContext);

    const list = <HTMLTableElement>document.getElementById("player_table_body");

    expect(list.children.length).toBe(MAX_PLAYERS);
    for (let i = 0; i < MAX_PLAYERS; i++) {
      expect(list.querySelector(`#${getNameFieldId(i)}`)).not.toBeNull();
    }
  });
});

describe("Test setup buttons", () => {
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
        <table id="player_list">
            <thead>
                <th>#</th>
                <th><input type="checkbox" id="cb_toggle_all" checked="true" title="Toggle All" /></th>
                <th>Player Name</th>
                <th>HotKey Assignment</th>
            </thead>
            <tbody id="player_table_body">
            ${generatePlayerRows(playerContext.playerList())}
            </tbody>
        </table>
    </div>
    <button type="button" id="btn_copy_to">Copy to Clipboard</button>
    <button type="button" id="btn_clear_names">Clear All</button>
    `;
  });

  afterEach(() => {
    localStorageMock.clear();
    playerContext.resetState();
  });

  it('should provision "Toggle All" checkbox with event', () => {
    setUpButtons(playerContext);
    const toggleAllButton = <HTMLInputElement>(
      document.querySelector("#cb_toggle_all")
    );
    toggleAllButton.click();
    for (let i = 0; i < MAX_PLAYERS; i++) {
      const checkbox = <HTMLInputElement>(
        document.querySelector(`#${getCheckboxId(0)}`)
      );
      // They'll be true by default since they're all being set in
      // `generatePlayerRows`, so we're turning them off with the
      // `togleAllButton.click()` above
      expect(checkbox.checked).toBe(false);
    }
  });

  it('should provision "Clear Names" button with event', () => {
    setUpButtons(playerContext);

    playerContext.playerList().forEach((player: Player) => {
      const input = <HTMLInputElement>(
        document.querySelector(`#${getNameFieldId(player.rowIndex)}`)
      );
      if (player.name !== "") {
        expect(input.value).not.toBe("");
      }
    });

    const clearNamesButton = <HTMLButtonElement>(
      document.querySelector("#btn_clear_names")
    );

    clearNamesButton.click();

    playerContext.playerList().forEach((player: Player) => {
      const input = <HTMLInputElement>(
        document.querySelector(`#${getNameFieldId(player.rowIndex)}`)
      );
      expect(input.value).toBe("");
    });
  });

  it('should provision "Copy to Clipboard" button with event', () => {
    const expected = "Ben\nRyan\nCaleb\nJeff";
    setUpButtons(playerContext);
    const copyToClipboardButton = <HTMLButtonElement>(
      document.querySelector("#btn_copy_to")
    );
    copyToClipboardButton.click();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expected);
  });
});

describe("Test main", () => {
  let playerContext: PlayerListContext;
  beforeEach(() => {
    playerContext = PlayerListContext.getInstance(DB);
  });
  afterEach(() => {
    playerContext.resetState();
    localStorageMock.clear();
  });

  it("should setup the player list and buttons and activate subscribers", () => {
    const addEventListenerSpy = jest
      .spyOn(document, "addEventListener")
      .mockImplementation(() => {});
    expect(playerContext.getSubscribers().length).toBe(0);
    main(playerContext);

    expect(addEventListenerSpy).toHaveBeenCalled();
    expect(playerContext.getSubscribers().length).not.toBe(0);
  });
});

describe("Test initializing subscribers", () => {
  let playerContext: PlayerListContext;
  beforeEach(() => {
    playerContext = PlayerListContext.getInstance(DB);
  });
  afterEach(() => {
    playerContext.resetState();
    localStorageMock.clear();
  });
  it("should setup the player list and buttons and activate subscribers", () => {
    expect(playerContext.getSubscribers().length).toBe(0);
    initSubscriptions(playerContext);
    expect(playerContext.getSubscribers().length).not.toBe(0);
  });
});
