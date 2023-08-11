export type DataContainerNodeWithRaw<T> = Record<string, unknown> & {
  key: string;
  value: unknown;
  title: string;
  visible: boolean;
  raw: T;
  prev: DataContainerNode<T> | null;
  next: DataContainerNode<T> | null;
};

export type DataContainerNode<T> = Record<string, unknown> & {
  key: string;
  value: unknown;
  title: string;
  visible: boolean;
  raw: DataContainerNodeWithRaw<T> | null;
  prev: DataContainerNode<T> | null;
  next: DataContainerNode<T> | null;
};

export type DataItemKey = string | number | symbol;

export type DataContainer<T> = Map<DataItemKey, DataContainerNode<T>>;
