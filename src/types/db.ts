export type DataBase = {
  getAllData: () => Storage;
  write: (key: string, value: string) => void;
};
