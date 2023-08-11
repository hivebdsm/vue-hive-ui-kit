<script setup lang="ts">
import HiveObservable from '@/components/hive-observable/hive-observable.vue';
import HiveInput from '@/components/hive-input/hive-input.vue';

import { CommonProps } from '@/common/mixin/props';
import useHiveMultiselect, {
  DropDownListMultipleConfig,
  OptionsType,
} from '@/components/hive-multiselect/hooks/use-hive-multiselect';
import {
  Focusin,
  Focusout,
  Keydown,
  Mount,
  Unmount,
  Update,
  Search,
  Input,
  onInput,
  onFocusout,
  onFocusin,
  onKeydown,
  onSearch,
  onUpdateModelValue,
} from '@/common/mixin/emits';
import { useExpandListMethods } from '@/common/hooks/use-expand-list-methods';
import useHiveMultiselectMethods from '@/components/hive-multiselect/hooks/use-hive-multiselect-methods';
import { Options } from '@/common/types/option';
import { ref, toRaw, watch } from 'vue';

export interface Props extends CommonProps {
  options: OptionsType;
  modelValue: string[];
  disctinct?: boolean;
  modelValueEventName?: string;
  minQueryLength?: number;
  placeholder?: string;
  invalid?: boolean;
  minValue?: number;
  keyField?: string;
  mask?: RegExp;
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
}

const props = withDefaults(defineProps<Props>(), {
  modelValueEventName: 'input',
  type: 'text',
  placeholder: 'input',
  invalid: false,
  integer: false,
  nullTitle: 'Не выбрано',
  titleField: 'title',
  distinct: false,
  minQueryLength: 0,
});

type Emit = Mount & Unmount & Update<string[]> & Focusin & Focusout & Keydown & Input<string> & Search<string>;

const emit = defineEmits<Emit>();

const menuRef = ref(null);
const multiSelectRef = ref(null);

const { currentValue, activeValue, currentOptions, filteredOptions, unfilteredOptions, searchQuery } =
  useHiveMultiselect(props as DropDownListMultipleConfig);

const {
  isExpanded,
  searchRef,
  expand,
  collapse,
  toggle,
  updateActiveValue,
  setPrevActiveValue,
  setNextActiveValue,
  onAppear,
  onDisappear,
} = useExpandListMethods({
  searchQuery,
  currentValue,
  activeValue,
  filteredOptions,
});

const { addToCurrentValue, removeFromCurrentValue, onBackspace } = useHiveMultiselectMethods({
  activeValue,
  currentValue,
  filteredOptions,
  collapse,
  searchQuery,
});

watch(
  () => props.options as Options,
  (newValue) => {
    if (Array.isArray(newValue)) {
      if (props.withNull) {
        newValue.unshift({
          [props.titleField]: props.nullTitle,
          [props.valueField ?? 'value']: null,
        });
      }
      currentOptions.value = newValue;
    } else {
      currentOptions.value = newValue;
    }
  },
);

watch(
  () => activeValue.value,
  (newValue) => {
    const activeOption = filteredOptions.value[newValue as string];
    if (!activeOption) {
      return;
    }

    if (!activeOption.visible && isExpanded.value) {
      const el = (menuRef.value as unknown as HTMLElement)?.querySelector(`[data-value='${newValue}']`);
      (el as unknown as HTMLElement)?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  },
  { flush: 'post' },
);

watch(
  () => props.modelValue?.length,
  () => {
    const value = toRaw(props.modelValue);
    currentValue.value = [];
    value.forEach((val) => addToCurrentValue(val, true));
    onUpdateModelValue<string[]>(emit, currentValue.value as string[]);
  },
);
</script>

<template>
  <div
    :style="style"
    class="hive-drop-down-multiselect"
    @focusin="expand()"
    @focusout="collapse()"
    @mousedown="toggle"
    :class="{ 'active visible': isExpanded }"
    ref="multiSelectRef"
  >
    <i class="hive-drop-down__icon" :class="{ expand: isExpanded }" @mousedown="toggle" />
    <a v-for="value in currentValue" :key="(value as string)" class="selected-value" @mousedown.stop.prevent>
      {{ unfilteredOptions[value as string]?.title ? unfilteredOptions[value as string].title : value }}
      <i class="delete icon" @mousedown="removeFromCurrentValue(value)"></i>
    </a>
    <hive-input
      v-model="searchQuery"
      ref="searchRef"
      class="search"
      placeholder=""
      tabindex="0"
      :disabled="disabled"
      @focusin="expand(), onFocusin(emit)"
      @focusout="collapse(), onFocusout(emit)"
      @keydown="onKeydown(emit, $event)"
      @keydown.enter="addToCurrentValue(activeValue)"
      @keydown.up.prevent="setPrevActiveValue"
      @keydown.down.prevent="setNextActiveValue"
      @keydown.esc="collapse"
      @keydown.delete.exact="onBackspace"
      @input="onInput(emit, $event as string)"
    />
    <div ref="menuRef" :class="{ visible: isExpanded, hidden: !isExpanded }" class="menu">
      <transition name="fade" appear>
        <div
          v-if="isExpanded"
          class="hive-drop-down__menu"
          :style="{
            height: menuHeight,
          }"
        >
          <div
            v-for="(item, i) in filteredOptions"
            :key="i"
            class="hive-drop-down__menu-item"
            :class="{
              selected: item[1][valueField] === activeValue || (item[1][valueField] === null && activeValue === 'null'),
            }"
            @click.prevent="addToCurrentValue(item[1][valueField])"
            @mouseover="updateActiveValue(item[1][valueField])"
            @mousedown.prevent
          >
            <slot name="before" :value="item?.raw?.raw" />
            {{ item[1][titleField] }}
            <slot name="after" :value="item?.raw?.raw" />
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/variables.scss';

.hive-drop-down-multiselect {
  display: flex;
  align-items: ce;
  flex-wrap: wrap;
  position: relative;
  height: 2.2rem;
  padding: 5px;
  padding-right: 15px;
  word-wrap: break-word;
  white-space: normal;
  outline: 0;
  transform: rotate(0);
  min-width: 14em;
  background: #ffffff;
  color: #000000de;
  box-shadow: none;
  border: 1px solid rgba(34, 36, 38, 0.15);
  border-radius: $border-radius;
  transition: box-shadow 0.1s ease, width 0.1s ease, -webkit-box-shadow 0.1s ease;
  box-sizing: border-box;
  font-size: 14px;

  .dropdown.icon {
    cursor: default;
    position: absolute;
    width: auto;
    height: auto;
    top: 0.78571429em;
    right: 1em;
    z-index: 3;
    margin: -0.78571429em;
    padding: 0.91666667em;
    opacity: 0.8;
    transition: opacity 0.1s ease;
    min-width: 1em;
  }

  .search {
    position: static;
    padding: 0;
    max-width: 100%;
    margin: 5px;
    width: 2.2em;
    min-width: 150px;
    margin-left: 0.14285714em;
    z-index: 2;
    flex-grow: 1000;
    overflow: visible;
    font-family: inherit;
    font-size: 100%;
    box-sizing: inherit;
    background: none transparent;
    border: none;
  }

  .selected-value {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    white-space: normal;
    padding: 3px 10px;
    margin: 0 3px;
    box-shadow: 0 0 0 1px #22242626 inset;
    vertical-align: baseline;
    background-color: #e8e8e8;
    background-image: none;
    color: #0009;
    text-transform: none;
    font-weight: 700;
    border: 0 solid transparent;
    border-radius: 0.28571429rem;
    transition: background 0.1s ease;
    position: relative;
    box-sizing: border-box;
    cursor: pointer;
    visibility: visible;
    height: 100%;
    font-size: 14px;
  }

  .menu {
    overflow-x: hidden;
    overflow-y: auto;
    backface-visibility: hidden;
    border-top-width: 0;
    width: auto;
    outline: none;
    margin: 0 -1px;
    min-width: calc(100% + 2px);
    width: calc(100% + 2px);
    border-radius: 0 0 0.28571429rem 0.28571429rem;
    box-shadow: 0 2px 3px #22242626;
    transition: opacity 0.1s ease;
    left: 0;
    position: absolute;
    display: none;
    outline: none;
    top: 100%;
    padding: 0;
    background: #ffffff;
    text-shadow: none;
    text-align: left;
    border-radius: 0.28571429rem;
    z-index: 11;
    will-change: transform, opacity;

    &.visible {
      display: block;
      visibility: visible;
    }
  }

  .item {
    border-top: 1px solid #fafafa;
    padding: 0.78571429rem 1.14285714rem;
    white-space: normal;
    word-wrap: normal;
    position: relative;
    cursor: pointer;
    display: block;
    border: none;
    height: auto;
    text-align: left;
    color: #000000de;
    text-transform: none;
    font-weight: 400;
    box-shadow: none;
    box-sizing: inherit;

    &.selected {
      background: rgba(0, 0, 0, 0.03);
      color: #000000f2;
    }
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
