import { onMounted, onUnmounted } from 'vue';
import { Mount, Unmount } from '@/common/mixin/emits';

export const useOnMount = (emit: Mount & Unmount) => {
  onMounted(() => {
    emit('mount');
  });
  onUnmounted(() => {
    emit('unmount');
  });
};
