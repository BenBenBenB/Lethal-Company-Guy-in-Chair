export type Listener = () => void;
export type Subscriber = { name: string; listener: Listener };
