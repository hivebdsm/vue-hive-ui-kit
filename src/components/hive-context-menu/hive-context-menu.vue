<script lang="ts" setup>
import { CommonProps } from '@/common/mixin/props';
import { ContextMenuItems } from './types';
import HiveContextMenuItem from './hive-context-menu-item.vue';
import { getCurrentInstance, ref, onMounted, reactive, onUnmounted } from 'vue';
import { Ref, RendererNode } from 'vue';

export interface Props extends CommonProps {
  items: ContextMenuItems | undefined;
  appendTo?: string | HTMLElement;
  left?: number;
  top?: number;
  showOnMount?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  appendTo: 'body ',
  left: 0,
  top: 0,
  showOnMount: false,
});

const inctance = getCurrentInstance();

const parentNode: Ref<RendererNode | null | undefined> = ref(null);

const show = ref(false);
const position = reactive({
  left: props.left,
  top: props.top,
});

const showContextMenu = (e: PointerEvent) => {
  e.preventDefault();
  show.value = true;
  position.left = e.pageX;
  position.top = e.pageY;
};

const hideContextMenu = () => {
  show.value = false;
};

onMounted(() => {
  parentNode.value = inctance?.parent?.vnode.el;
  if (props.showOnMount) {
    show.value = true;
  } else {
    parentNode.value?.addEventListener('contextmenu', showContextMenu);
  }
  window.addEventListener('click', hideContextMenu);
});

onUnmounted(() => {
  parentNode.value?.removeEventListener('contextmenu', showContextMenu);
  window.removeEventListener('click', hideContextMenu);
});
</script>

<template>
  <div
    v-if="show"
    @click.stop
    :class="{ 'sub-menu': showOnMount, 'context-menu': !showOnMount }"
    :style="{ left: position.left + 'px', top: position.top + 'px' }"
  >
    <hive-context-menu-item v-for="(item, index) in items" :key="index" :item="item" />
  </div>
</template>

<style lang="scss" scoped>
.context-menu {
  position: absolute;
  z-index: 1001;
  padding: 0.25rem 0;
  background: #ffffff;
  color: #4b5563;
  border: 0 none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  width: 12.5rem;
}

.sub-menu {
  position: absolute;
  z-index: 1;
  padding: 0.25rem 0;
  background: #ffffff;
  color: #4b5563;
  border: 0 none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  width: 12.5rem;
}
</style>
