import { type DataBase } from "../types/db";

const getAllData = (): Storage => {
  return { ...localStorage };
};

const write = (key: string, value: string) => {
  localStorage.setItem(key, value);
};

const DB = {
  getAllData,
  write,
} as DataBase;

export default DB;
