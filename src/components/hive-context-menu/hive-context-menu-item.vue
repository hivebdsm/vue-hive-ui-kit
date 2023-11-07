<script lang="ts" setup>
import { CommonProps } from '@/common/mixin/props';
import { ContextMenuSeparator, ContextMenuItem } from './types';
import { computed, ref, onMounted, getCurrentInstance, reactive } from 'vue';
import { useIsSeparator } from './hooks/use-is-separator';
import { useIsItem } from './hooks/use-is-item';
import hiveContextMenu from './hive-context-menu.vue';

export interface Props extends CommonProps {
  item: ContextMenuSeparator | ContextMenuItem;
}

const props = withDefaults(defineProps<Props>(), {});

const isSeparator = computed(() => useIsSeparator(props.item));
const isItem = computed(() => useIsItem(props.item));

const showChildren = ref(false);

const instance = getCurrentInstance();

const position = reactive({
  left: 0,
  top: 0,
});

onMounted(() => {
  position.left = instance?.vnode?.el?.clientWidth;
  position.top = 0;
});
</script>

<template>
  <div v-if="isSeparator" class="separator"></div>
  <div
    v-else-if="isItem"
    class="item"
    @mouseover="showChildren = true"
    @mouseleave="showChildren = false"
    :class="{'has-children': (item as ContextMenuItem).items !== undefined}"
  >
    {{ (item as ContextMenuItem).label }}
    <hive-context-menu
      v-if="(item as ContextMenuItem).items !== undefined && showChildren"
      :items="(item as ContextMenuItem).items"
      :left="position.left"
      :top="position.top"
      show-on-mount
    />
  </div>
</template>

<style lang="scss" scoped>
.separator {
  border-top: 1px solid #e5e7eb;
  margin: 0.25rem 0;
}

.item {
  padding: 0.5rem 1rem;
  user-select: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  text-decoration: none;
  overflow: hidden;
  position: relative;
  box-sizing: border-box;

  &:hover {
    background-color: #f3f4f6;
  }
}

.has-children {
  overflow: inherit;
}
</style>
