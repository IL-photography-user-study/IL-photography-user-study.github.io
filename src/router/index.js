/*
 * @Author: liaozhilan lzl16975772022@163.com
 * @Date: 2025-06-27 10:24:55
 * @LastEditors: liaozhilan lzl16975772022@163.com
 * @LastEditTime: 2025-06-29 21:47:44
 * @FilePath: \IL-photography\src\router\index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
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
    meta: { title: 'Thank you!' }
  }
];

const router = new VueRouter({
  mode: 'history',
  routes
});

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'User Study for IL-photography';
  next();
});

export default router;
