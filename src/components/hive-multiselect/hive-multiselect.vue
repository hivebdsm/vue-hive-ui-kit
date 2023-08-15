<script lang="ts">
import HiveObservable from '@/components/hive-observable/hive-observable.vue';
import { CommonProps } from '@/common/mixin/props';
import { MaskValue } from '@/common/types/mask';
import useHiveMultiselect, {
  DropDownListMultipleConfig,
  OptionsType,
} from '@/components/hive-multiselect/hooks/use-hive-multiselect';

export interface Props extends CommonProps {
  options: OptionsType;
  modelValue: string | string[];
  modelValueEventName?: string;
  placeholder?: string;
  invalid?: boolean;
  type?: 'number' | 'text';
  integer?: boolean;
  mask?: MaskValue;
  minValue?: number;
  keyField?: string;
  valueField?: string;
  titleField?: string;
  menuHeight?: string;
  withImg?: boolean;
  imgsArray?: string[] | Record<string, string>;
  empty?: boolean;
  withNull?: boolean;
  nullTitle?: string;
  disabled?: boolean;
  focusOnMount?: boolean;
  minQueryLength?: number;
  distinct?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  modelValueEventName: 'input',
  options: () => [],
  type: 'text',
  placeholder: 'input',
  invalid: false,
  integer: false,
  nullTitle: 'Не выбрано',
  titleField: 'title',
  distinct: false,
});

const { currentValue, activeValue, currentOptions, filteredOptions, unfilteredOptions, searchQuery } =
  useHiveMultiselect(props as DropDownListMultipleConfig);

// export default defineComponent({
//   name: 'HiveMultiselect',
//   emits: ['update:modelValue', 'event'],
//   components: {
//     HiveObservable,
//   },
//   mounted() {
//     useOnMount(this);
//   },
//   setup(props, context) {
//     const { component } = useComponent();
//     const menuRef = ref(undefined);
//     const multiSelectRef = ref(undefined);

//     const { currentValue, activeValue, currentOptions, filteredOptions, unfilteredOptions, searchQuery } =
//       useHiveMultiselect(props as unknown as DropDownListMultipleConfig);

//     const handleEvent = useEventHandler({
//       props,
//       context,
//       modelValue: currentValue,
//       component,
//       modelValueEventName: props.modelValueEventName,
//     });

//     const {
//       isExpanded,
//       searchRef,
//       expand,
//       collapse,
//       toggle,
//       updateActiveValue,
//       setActiveValueToFirst,
//       setPrevActiveValue,
//       setNextActiveValue,
//       onAppear,
//       onDisappear,
//     } = useDropDownMethods({
//       searchQuery,
//       activeValue,
//       filteredOptions,
//       handleEvent,
//     });

//     const currentClasses = useClasses({
//       classes: props.classes as ClassesType,
//       extraClasses: { 'active visible': isExpanded },
//     });

//     const { addToCurrentValue, removeFromCurrentValue, onBackspace } = useHiveMultiselectMethods({
//       activeValue,
//       currentValue,
//       filteredOptions,
//       collapse,
//       searchQuery,
//       handleEvent,
//     });

//     usePickerEventTriggering({
//       popupVisibilityProp: isExpanded,
//       eventOnPopupClosing: props.eventOnPopupClosing,
//       currentValue,
//       modelValueEventName: props.modelValueEventName,
//       handleEvent,
//     });

//     watch(
//       () => props.options as OptionsType,
//       (newValue: OptionsType) => {
//         currentOptions.value = newValue;
//         handleEvent(new Event('onDataBound'));
//       },
//     );

//     watch(
//       () => activeValue.value,
//       (newValue, prevValue) => {
//         const activeOption = filteredOptions.value[newValue as string];

//         if (!activeOption) {
//           return;
//         }

//         if (!activeOption.visible && isExpanded.value) {
//           const el = (menuRef.value as unknown as HTMLElement).querySelector(`[data-value='${newValue}']`);

//           (el as unknown as HTMLElement).scrollIntoView({
//             behavior: 'smooth',
//             block: 'nearest',
//           });
//         }
//       },
//       { flush: 'post' },
//     );

//     watch(
//       () => props.modelValue?.length,
//       () => {
//         const value = toRaw(props.modelValue);
//         currentValue.value = [];
//         value.forEach((val) => addToCurrentValue(val, true));
//         context.emit('update:modelValue', currentValue.value);
//       },
//     );

//     const onInput = (event: Event) => {
//       handleEvent(event, searchQuery.value);
//     };

//     const onKeyDown = (event: Event) => {
//       handleEvent(event, searchQuery.value);
//     };

//     return {
//       component,
//       menuRef,
//       multiSelectRef,
//       isExpanded,
//       currentClasses,
//       searchRef,
//       currentOptions,
//       currentValue,
//       activeValue,
//       filteredOptions,
//       unfilteredOptions,
//       searchQuery,
//       addToCurrentValue,
//       removeFromCurrentValue,
//       onBackspace,
//       updateActiveValue,
//       setPrevActiveValue,
//       setNextActiveValue,
//       setActiveValueToFirst,
//       onAppear,
//       onDisappear,
//       expand,
//       collapse,
//       toggle,
//       handleEvent,
//       onInput,
//       onKeyDown,
//     };
//   },
// });
</script>

<template>
  <div
    :style="style"
    class="ui multiple search dropdown selection hive-drop-down-multiselect"
    @focusin="
      (e) => {
        expand();
      }
    "
    @focusout="
      (e) => {
        collapse();
      }
    "
    @mousedown="toggle"
    ref="multiSelectRef"
  >
    <i class="dropdown icon"></i>
    <a v-for="value in currentValue" :key="(value as string)" class="ui label visible" @mousedown.stop.prevent>
      {{ unfilteredOptions[value as string]?.title ? unfilteredOptions[value as string].title : value }}
      <i class="delete icon" @mousedown="removeFromCurrentValue(value)"></i>
    </a>
    <input
      ref="searchRef"
      :placeholder="placeholder"
      :value="searchQuery"
      autocomplete="fomantic-search"
      class="search search-input"
      tabindex="0"
      @keydown="onKeyDown"
      @input="
        searchQuery = ($event.target as HTMLInputElement).value;
        setActiveValueToFirst();
        onInput($event);
      "
      @keydown.up.exact="setPrevActiveValue"
      @keydown.down.exact="setNextActiveValue"
      @keydown.enter.exact="addToCurrentValue(activeValue)"
      @keydown.esc.exact="collapse"
      @keydown.delete.exact="onBackspace"
    />
    <div ref="menuRef" :class="{ visible: isExpanded, hidden: !isExpanded }" class="menu transition">
      <hive-observable
        v-for="option in filteredOptions"
        :key="option.key"
        :root="menuRef"
        :threshold="0.2"
        @appear="onAppear(option)"
        @disappear="onDisappear(option)"
      >
        <div
          :class="{
            'active selected': option.value === activeValue,
          }"
          :data-value="option.value"
          class="item"
          @click.prevent="addToCurrentValue(option.value)"
          @mouseover="updateActiveValue(option.value)"
          @mousedown.prevent
        >
          <slot name="before" :value="option.raw?.raw" />
          {{ String(option.title) }}
          <slot name="after" :value="option.raw?.raw" />
        </div>
      </hive-observable>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '../../assets/css/semantic.css';

.hive-drop-down-multiselect {
  display: flex !important;
  flex-wrap: wrap;
  position: relative;
  height: auto;

  .dropdown.icon {
    cursor: default !important;
  }
}

.label {
  height: fit-content;
}

.search-input {
  height: fit-content;
  flex-grow: 1000;
}
</style>