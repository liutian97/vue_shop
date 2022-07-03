import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'

// 导入全局样式表
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'

// 配置 axios 发起登录请求
// 导入 axios 包，并挂载在 Vue 的实例原型对象上
import axios from 'axios'
Vue.prototype.$http = axios // 每一个Vue 组件可以直接通过 $http 发起axios请求
// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'


Vue.config.productionTip = false

new Vue({
  router,
  render: (h) => h(App)
}).$mount('#app')
