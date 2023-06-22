import { watch, Ref } from 'vue';

export const useModelValue = <T>(value: Ref<T>, emit: Update<T>) => {
  watch(value, () => {
    emit('update:modelValue', value.value);
  });
};

export type Update<T> = (e: 'update:modelValue', value: T) => void;
