import { localStorageMock } from "../../tests/mocks/local-storage.mock";
import DB from "./db";

describe("Test db methods", () => {
  beforeAll(() => {
    global.window.localStorage = localStorageMock;
  });

  beforeEach(() => {
    localStorage.clear();
  });

  it("should fetch all data", () => {
    localStorage.setItem("item1", "1");
    localStorage.setItem("item2", "2");
    const result = DB.getAllData();
    expect(result).toStrictEqual({ item1: "1", item2: "2" });
  });

  it("should write data", () => {
    const testKey = "players";
    const expected = "ryan,ben";

    DB.write(testKey, expected);
    const result = localStorage.getItem(testKey);

    expect(result).toBe(expected);
  });
});
