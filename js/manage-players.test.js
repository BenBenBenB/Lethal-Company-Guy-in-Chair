const {
  createPlayerRow,
  getCheckboxId,
  getNameFieldId,
  main,
  saveToClipboard,
  setPlayerList,
  setUpButtons,
  setUpList,
  toggleAllCheckboxes,
  HOTKEYS,
  INITIAL_PLAYERS,
  MAX_PLAYERS,
} = require("./manage-players");

const generatePlayerRows = (count) => {
  let body = "";
  for (let i = 0; i < count; i++) {
    body += `
        <td>${i}</td>
        <td>
          <input type="checkbox" id="player${i}_cb" title="Check to include in camera view.">
        </td>
        <input id="player${i}_name" type="text" />
      `;
  }
  return body;
};

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
});

describe("Test set players", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div>
      ${generatePlayerRows(5)}
      </div>
    `;
  });

  it("Should generate player list", () => {
    const players = ["Ben", "Ryan", "Caleb", "Jeff", ""];
    setPlayerList(players);
    players.forEach((name, index) => {
      const textbox = document.getElementById(`player${index}_name`);
      const checkbox = document.getElementById(`player${index}_cb`);
      expect(textbox.value).toBe(name);
      expect(checkbox.value).toBe("on");
    });
  });
});

describe("Save to clipboard", () => {
  beforeEach(() => {
    global.navigator.clipboard = {
      writeText: jest.fn().mockResolvedValue(undefined),
    };
    document.body.innerHTML = `
      <div>
      ${generatePlayerRows(12)}
      </div>
    `;
    const players = ["Ben", "Ryan", "Caleb", "Jeff", "ignore me", ""];
    setPlayerList(players);
  });

  it("should save values to clipboard", async () => {
    const expected = "Ben\nRyan\nCaleb\nJeff\nIGNOREDPLAYER:ignore me";
    const IgnoredCheckbox = document.querySelector(`#${getCheckboxId(4)}`);
    // Manually un-check checkbox for "ignore me" player
    IgnoredCheckbox.checked = false;
    await saveToClipboard();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expected);
  });
});

describe("Test create player row", () => {
  beforeEach(() => {
    global.navigator.clipboard = {
      writeText: jest.fn().mockResolvedValue(undefined),
    };
    document.body.innerHTML = `
      <div>
      ${generatePlayerRows(12)}
      </div>
    `;
    const players = ["Ben", "Ryan", "Caleb", "Jeff", ""];
    setPlayerList(players);
  });

  it("Should create player row with hotkey", () => {
    const rowIndex = 0;
    const row = createPlayerRow(rowIndex);

    expect(row.tagName).toBe("TR");

    const checkbox = row.querySelector(`#${getCheckboxId(rowIndex)}`);
    const textbox = row.querySelector(`#${getNameFieldId(rowIndex)}`);
    expect(checkbox).not.toBeNull();
    expect(textbox).not.toBeNull();

    expect(checkbox.checked).toBe(false);

    const hotkey = row.querySelector("b").textContent;
    expect(hotkey).toBe(HOTKEYS[rowIndex]);
  });

  it("Should create player row with no hotkey", () => {
    const rowIndex = -1;
    const row = createPlayerRow(rowIndex);
    const hotkey = row.querySelector("b").textContent;
    expect(hotkey).toBe("");
  });

  it("Should check the checkbox when text is entered in the textbox", () => {
    const rowIndex = 0;
    const row = createPlayerRow(rowIndex);
    const checkbox = row.querySelector(`#${getCheckboxId(rowIndex)}`);
    const textbox = row.querySelector(`#${getNameFieldId(rowIndex)}`);
    const expected = "Ben\nRyan\nCaleb\nJeff";

    textbox.value = "Player Name";
    textbox.dispatchEvent(new Event("keyup"));

    expect(checkbox.checked).toBe(true);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expected);
  });
});

describe("Test setup list", () => {
  beforeEach(() => {
    document.body.innerHTML = `
        <table>
            <tbody id="player_table_body"></tbody>
        </table>
    `;
    global.navigator.clipboard = {
      writeText: jest.fn().mockResolvedValue(undefined),
    };
  });

  it("should populate the player list with the correct number of players", async () => {
    const expectedNames = INITIAL_PLAYERS.join("\n");
    await setUpList();

    const list = document.getElementById("player_table_body");

    expect(list.children.length).toBe(MAX_PLAYERS);
    for (let i = 0; i < MAX_PLAYERS; i++) {
      expect(list.querySelector(`#${getNameFieldId(i)}`)).not.toBeNull();
    }

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expectedNames);
  });
});

describe("Test toggle all checkboxes", () => {
  beforeEach(() => {
    global.navigator.clipboard = {
      writeText: jest.fn().mockResolvedValue(undefined),
    };
    document.body.innerHTML = `
      <div>
      ${generatePlayerRows(MAX_PLAYERS)}
      </div>
    `;
    const players = ["Ben", "Ryan", "Caleb", "Jeff", ""];
    setPlayerList(players);
  });

  it("Should Toggle All Checkboxes on and save results to clipboard", async () => {
    const expected = "Ben\nRyan\nCaleb\nJeff";
    await toggleAllCheckboxes(true);
    for (let i = 0; i < 4; i++) {
      const checkbox = document.querySelector(`#${getCheckboxId(i)}`);
      expect(checkbox.checked).toBe(true);
    }
    const checkbox = document.querySelector(`#${getCheckboxId(5)}`);
    // The 5th entry in the `players` array is blank
    expect(checkbox.checked).toBe(false);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expected);
  });

  it("Should Toggle All Checkboxes off and save results to clipboard", async () => {
    const expected =
      "IGNOREDPLAYER:Ben\nIGNOREDPLAYER:Ryan\nIGNOREDPLAYER:Caleb\nIGNOREDPLAYER:Jeff";
    await toggleAllCheckboxes(false);
    for (let i = 0; i < 5; i++) {
      const checkbox = document.querySelector(`#${getCheckboxId(i)}`);
      expect(checkbox.checked).toBe(false);
    }
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expected);
  });
});

describe("Test setup buttons", () => {
  beforeEach(() => {
    global.navigator.clipboard = {
      writeText: jest.fn().mockResolvedValue(undefined),
    };
    document.body.innerHTML = `
    <div>
        <table id="player_list">
            <thead>
                <th>#</th>
                <th><input type="checkbox" id="cb_toggle_all" checked="true" title="Toggle All" /></th>
                <th>Names</th>
                <th>Key</th>
            </thead>
            <tbody id="player_table_body">
            ${generatePlayerRows(MAX_PLAYERS)}
            </tbody>
        </table>
    </div>
    <button type="button" id="btn_copy_to">Copy to Clipboard</button>
    <button type="button" id="btn_clear_names">Clear All</button>
    `;
    const players = ["Ben", "Ryan", "Caleb", "Jeff", ""];
    setPlayerList(players);
  });

  it('should provision "Toggle All" checkbox with event', () => {
    setUpButtons();
    const toggleAllButton = document.querySelector("#cb_toggle_all");
    toggleAllButton.click();
    for (let i = 0; i < MAX_PLAYERS; i++) {
      const checkbox = document.querySelector(`#${getCheckboxId(0)}`);
      // They'll be true by default since they're all being set in
      // `generatePlayerRows`, so we're turning them off with the
      // `togleAllButton.click()` above
      expect(checkbox.checked).toBe(false);
    }
  });

  it('should provision "Clear Names" button with event', () => {
    setUpButtons();
    for (let i = 0; i < 4; i++) {
      const input = document.querySelector(`#${getNameFieldId(i)}`);
      // First four names shouldn't be blank
      expect(input.value).not.toBe("");
    }
    const clearNamesButton = document.querySelector("#btn_clear_names");
    clearNamesButton.click();
    for (let i = 0; i < MAX_PLAYERS; i++) {
      const input = document.querySelector(`#${getNameFieldId(i)}`);
      expect(input.value).toBe("");
    }
  });

  it('should provision "Copy to Clipboard" button with event', () => {
    const expected = "Ben\nRyan\nCaleb\nJeff";
    setUpButtons();
    const copyToClipboardButton = document.querySelector("#btn_copy_to");
    copyToClipboardButton.click();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expected);
  });
});

describe("Test main", () => {
  it("should setup the player list and buttons", () => {
    const addEventListenerSpy = jest
      .spyOn(document, "addEventListener")
      .mockImplementation(() => {});
    main();
    expect(addEventListenerSpy).toHaveBeenCalled();
  });
});
