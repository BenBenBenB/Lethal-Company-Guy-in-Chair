document.addEventListener("DOMContentLoaded", () => {
  const MAX_PLAYERS = 12;
  const IGNORE_PREFIX = "IGNOREDPLAYER:";
  const INITIAL_PLAYERS = ["Old Yeller", "Murmuring"];
  const HOTKEYS = ["F5", "F6", "F7", "F8"];

  const getNameFieldId = (index) => `player${index}_name`;
  const getCheckboxId = (index) => `player${index}_cb`;

  const saveToClipboard = () => {
    const textToSave = Array.from({ length: MAX_PLAYERS }, (_, i) => {
      const checkbox = document.getElementById(getCheckboxId(i));
      const playerName = document
        .getElementById(getNameFieldId(i))
        .value.trim();
      return (
        playerName &&
        (checkbox.checked ? playerName : `${IGNORE_PREFIX}${playerName}`)
      );
    })
      .filter(Boolean)
      .join("\n");

    navigator.clipboard.writeText(textToSave);
  };

  const setPlayerList = (nameArray) => {
    nameArray.forEach((name, i) => {
      const textbox = document.getElementById(getNameFieldId(i));
      const checkbox = document.getElementById(getCheckboxId(i));
      textbox.value = name || "";
      checkbox.checked = !!name.trim(); // Check the box if the name is not empty
    });
  };

  const createPlayerRow = (i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${i + 1}.</td>
            <td><input type="checkbox" id="${getCheckboxId(
              i
            )}" title="Check to include in camera view."></td>
            <td><input type="text" id="${getNameFieldId(i)}"></td>
            <td><b title="Hotkey for swapping to this player.">${
              HOTKEYS[i] || ""
            }</b></td>
        `;
    const checkbox = row.querySelector(`#${getCheckboxId(i)}`);
    const textbox = row.querySelector(`#${getNameFieldId(i)}`);

    checkbox.addEventListener("change", saveToClipboard);
    textbox.addEventListener("keyup", (event) => {
      checkbox.checked = event.target.value.trim() !== "";
      saveToClipboard();
    });

    // Uncheck the checkbox if the textbox is empty
    if (!textbox.value.trim()) {
      checkbox.checked = false;
    }

    return row;
  };

  const setUpList = () => {
    const list = document.getElementById("player_table_body");
    Array.from({ length: MAX_PLAYERS }, (_, i) => createPlayerRow(i)).forEach(
      (row) => list.appendChild(row)
    );
    setPlayerList(INITIAL_PLAYERS);
    saveToClipboard();
  };

  const toggleAllCheckboxes = (check) => {
    Array.from({ length: MAX_PLAYERS }, (_, i) => {
      const checkbox = document.getElementById(getCheckboxId(i));
      const textbox = document.getElementById(getNameFieldId(i));
      if (check) {
        checkbox.checked = textbox.value.trim() !== "";
      } else {
        checkbox.checked = false;
      }
    });
    saveToClipboard();
  };

  const setUpButtons = () => {
    document
      .getElementById("cb_toggle_all")
      .addEventListener("click", (event) => {
        toggleAllCheckboxes(event.target.checked);
      });
    document
      .getElementById("btn_clear_names")
      .addEventListener("click", () =>
        setPlayerList(Array(MAX_PLAYERS).fill(""))
      );
    document
      .getElementById("btn_copy_to")
      .addEventListener("click", saveToClipboard);
  };

  setUpList();
  setUpButtons();
  toggleAllCheckboxes();
});
