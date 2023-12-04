export type DataBase = {
  get: (key: string) => string | null;
  getAllData: () => Storage;
  write: (key: string, value: string) => void;
};
