import { type DataBase } from "../types/db";

const getAllData = (): Storage => {
  return { ...localStorage };
};

const write = (key: string, value: string) => {
  localStorage.setItem(key, value);
};

const get = (key: string): string | null => localStorage.getItem(key);

const DB = {
  get,
  getAllData,
  write,
} as DataBase;

export default DB;
