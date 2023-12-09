import { localStorageMock } from "../../tests/mocks/local-storage";
import DB from "./db";

describe("Test db methods", () => {
  beforeAll(() => {
    global.window.localStorage = localStorageMock;
  });

  beforeEach(() => {
    localStorage.clear();
  });

  it("should write data", () => {
    const testKey = "players";
    const expected = "ryan,ben";

    DB.write(testKey, expected);
    const result = localStorage.getItem(testKey);

    expect(result).toBe(expected);
  });

  it("should get item by ID", () => {
    const testKey = "hotkey:player1_hk";
    const expected = "F3";

    DB.write(testKey, expected);
    const result = DB.get(testKey);

    expect(result).toBe(expected);
  });
});
