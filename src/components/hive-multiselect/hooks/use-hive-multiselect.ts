import { type ComputedRef, ref, type Ref, watch } from 'vue';
import type { Value } from '@/common/types/value';
import { useDataContainer } from '@/common/hooks/use-data-container-update';
import { DataContainer, DataContainerNode, DataContainerNodeWithRaw } from '@/common/types/data-container';
import { useSearch } from '@/common/hooks/use-search';
import useFilter, { CompareMode } from '@/common/hooks/use-filter';

type OptionType = string | number | Record<string, unknown>;
type OptionsType = Array<OptionType> | Record<string, OptionType>;
type CurrentValueType = Ref<Value[]>;
type ActiveValueType = Ref<Value | null>;
type FilteredOptionsType = ComputedRef<DataContainer<OptionType>>;

interface DropDownListMultipleConfig {
  modelValue: string[];
  options: OptionsType;
  keyField?: string;
  valueField?: string;
  titleField?: string;
  minQueryLength: number;
  disctinct: boolean;
}

interface DropDownListMultipleExport {
  currentValue: CurrentValueType;
  activeValue: ActiveValueType;
  currentOptions: Ref<OptionsType>;
  filteredOptions: ComputedRef<DataContainer<OptionType>>;
  unfilteredOptions: ComputedRef<DataContainer<OptionType>>;
  searchQuery: Ref<string>;
}

export type {
  CurrentValueType,
  ActiveValueType,
  FilteredOptionsType,
  OptionType,
  OptionsType,
  DropDownListMultipleConfig,
  DropDownListMultipleExport,
};

export default function useHiveMultiselect({
  modelValue,
  valueField,
  titleField,
  options,
  minQueryLength,
  disctinct,
}: DropDownListMultipleConfig): DropDownListMultipleExport {
  if (!Array.isArray(modelValue) && modelValue !== null) {
    throw new Error('Model value must be an array in MultiSelect');
  }
  if (modelValue === null) {
    modelValue = [];
  }
  const currentValue = ref(modelValue);
  const currentOptions = ref((options as Array<OptionType>)?.concat(modelValue));
  const unfilteredOptions = useDataContainer({
    valueField,
    titleField,
    data: currentOptions,
  });

  const { filtered: unselectedOptions } = useFilter({
    items: unfilteredOptions,
    fields: ['value'],
    caseInsensitive: true,
    defaultInvert: true,
    defaultCompareMode: CompareMode.Exact,
    query: currentValue,
    disctinct,
  });

  const { filtered: bufferedOptions, query: searchQuery } = useSearch<OptionType>({
    items: unselectedOptions,
    fields: ['title'],
    caseInsensitive: true,
    minQueryLength,
  });

  const filteredOptions: ComputedRef<DataContainer<OptionType>> = useDataContainer({
    valueField,
    titleField,
    data: bufferedOptions,
  });

  const activeValue = ref(Object.keys(filteredOptions.value)[0]);

  watch(
    () => currentOptions.value,
    () => {
      [activeValue.value] = Object.keys(filteredOptions.value);
    },
  );

  return {
    currentValue,
    activeValue,
    currentOptions,
    filteredOptions,
    unfilteredOptions,
    searchQuery,
  };
}
