import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'

// 导入全局样式表
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入 vue-table-with-tree-grid 依赖
import TreeTable from 'vue-table-with-tree-grid'
// 导入 富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme



// 配置 axios 发起登录请求
// 导入 axios 包，并挂载在 Vue 的实例原型对象上
import axios from 'axios'
Vue.prototype.$http = axios // 每一个Vue 组件可以直接通过 $http 发起axios请求
// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

// 通过 axios 请求拦截器添加 token，保证拥有获取数据的权限。
axios.interceptors.request.use((config) => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在最后必须 return config
  return config
})

Vue.config.productionTip = false
// 全局注册组件
Vue.component('tree-table', TreeTable)

// 将富文本编辑器注册为全局可用的组件
Vue.use(VueQuillEditor)

// 全局定义格式化时间过滤器
Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)

  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0') // padStart() ES6 为数值补全指定位数 指定的长度小于或者等于原字符串的长度，则返回原字符串。   不足两位，从头开始用0补全两位
  const d = (dt.getDate() + '').padStart(2, '0') // + '' 将日期的number类型转为string类型
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}` // yyyy-MM-dd hh:mm:ss
})

new Vue({
  router,
  render: (h) => h(App)
}).$mount('#app')
