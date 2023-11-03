<script lang="ts" setup>
import { CommonProps } from '@/common/mixin/props';

export interface Props extends CommonProps {
  modelValue: string | number;
  modelValueEventName?: string;
  type?: 'text' | 'number' | 'password' | 'email' | 'tel' | 'url' | 'search';
  placeholder?: string;
  mask?: RegExp;
  invalid?: boolean;
  integer?: boolean;
  min?: number;
  max?: number;
  step?: number;
  focusOnMount?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValueEventName: 'input',
  type: 'text',
  invalid: false,
  integer: false,
  step: 0.01,
});
</script>

<template></template>

<style lang="scss" scoped></style>
