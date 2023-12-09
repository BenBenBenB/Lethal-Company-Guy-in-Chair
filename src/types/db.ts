export type DataBase = {
  get: (key: string) => string | null;
  write: (key: string, value: string) => void;
};
