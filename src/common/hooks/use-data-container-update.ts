import { ComputedRef, Ref, computed } from 'vue';

export interface Data<T, V, U> {}

export type DataType<T> = Array<T> | Record<DataItemKey, T>;
export type DataRefType<T> = Ref<DataType<T>> | ComputedRef<DataType<T>>;
export type DataItemKey = string | number | symbol;

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

export type DataContainer<T> = Record<string, DataContainerNode<T>>;

export interface DataContainerConfig<T> {
  data: DataRefType<T>;
  valueField?: DataItemKey;
  titleField?: DataItemKey;
}

export const useDataContainer = <T>({ data, valueField, titleField }: DataContainerConfig<T>) => {
  const getValue = (item: T, key: DataItemKey): unknown => {
    if (valueField !== undefined && typeof item === 'object') {
      const value = (item as Record<DataItemKey, unknown>)[valueField];
      return value === undefined ? (item as Record<DataItemKey, unknown>).value : value;
    }
    if (data.value instanceof Array) {
      return item;
    }
    return key;
  };

  const getKey = (item: T, key: DataItemKey): string => String(getValue(item, key));

  const getTitle = (item: T): string => {
    if (item instanceof Object) {
      if (titleField !== undefined) {
        const title = (item as Record<DataItemKey, unknown>)[titleField];
        return title === undefined ? String((item as Record<DataItemKey, unknown>).title) : String(title);
      }
      throw new Error('use title-field option please');
    }
    return String(item);
  };

  const deleteRecurringValues = (obj: DataType<T>) => {
    if (Array.isArray(obj)) {
      const filterObj: DataType<T> = [];
      obj.filter((i) => {
        filterObj.find((o) => o[titleField] === i[titleField] && o[valueField] === i[valueField]);
      });
    }
  };

  return computed<DataContainer<T>>((): DataContainer<T> => {
    const result: DataContainer<T> = {};
    const dataCopy = JSON.parse(JSON.stringify(data.value)) as DataType<T>;

    let prev: DataContainerNode<T> | null = null;

    if (dataCopy) {
      for (const [key, value] of Object.entries(dataCopy)) {
        const dataKey = getKey(value, key);
        const current: DataContainerNodeWithRaw<T> = {
          key: dataKey,
          value: getValue(value, key),
          title: getTitle(value),
          visible: false,
          raw: value,
          prev,
          next: null,
        };

        if (prev !== null) {
          prev.next = current as DataContainerNode<T>;
        }

        result[dataKey] = current as DataContainerNode<T>;
        prev = current as DataContainerNode<T>;
      }
    }

    return result;
  });
};
