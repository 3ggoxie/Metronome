import { createRouter, createWebHashHistory } from 'vue-router';
import MetronomeView from '@/views/MetronomeView.vue';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'metronome',
      component: MetronomeView,
    },
  ],
});

export default router;
