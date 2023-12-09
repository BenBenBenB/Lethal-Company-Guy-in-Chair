import { mockPlayers } from "../../../tests/mocks/players";
import { PlayerRow } from "./player-row";

describe("Test PlayerRow", () => {
  it("Should return the correct component", () => {
    const player = mockPlayers[0];
    const expected = `
              <td>1.</td>
              <td><input type="checkbox" id="player0_cb" title="Check to include in camera view." checked></td>
              <td><input type="text" id="player0_name" value="Ben"></td>
              <td><input id="player0_hk" title="Hotkey for swapping to this player." value="F1"></td>`;
    const playerRow = PlayerRow(player);
    expect(playerRow).toBe(expected);
  });
});
