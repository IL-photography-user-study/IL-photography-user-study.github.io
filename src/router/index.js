import Vue from 'vue';
import VueRouter from 'vue-router';
import Page from '@/page.vue';
import Thanks from '@/thanks.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Page',
    component: Page,
    meta: { title: 'User Study for IL-photography' }
  },
  {
    path: '/thanks',
    name: 'Thanks',
    component: Thanks,
    meta: { title: 'Thank You' }
  }
];

const router = new VueRouter({
  mode: 'history',
  routes
});
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Default Title';
  next();
});


export default router;
