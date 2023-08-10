import { ComputedRef } from 'vue';

export type Value = string | number | null;

export type Option = {
  [key: string]: Value
};