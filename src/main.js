import Vue from 'vue'
import page from './page.vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'

Vue.config.productionTip = false
Vue.use(Antd)

new Vue({
  render: h => h(page)
}).$mount('#app')
