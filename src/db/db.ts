import { type DataBase } from "../types/db";

const write = (key: string, value: string) => {
  localStorage.setItem(key, value);
};

const get = (key: string): string | null => localStorage.getItem(key);

const DB = {
  get,
  write,
} as DataBase;

export default DB;
