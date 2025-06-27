import Vue from 'vue';
import VueRouter from 'vue-router';
import Page from '@/page.vue';
import Thanks from '@/thanks.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Page',
    component: Page
  },
  {
    path: '/thanks',
    name: 'Thanks',
    component: Thanks
  }
];

const router = new VueRouter({
  mode: 'history',
  routes
});

export default router;
