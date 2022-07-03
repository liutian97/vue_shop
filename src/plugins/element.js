import Vue from 'vue'
// 按需导入相应到的组件   弹窗提示消息
import { Form, FormItem, Input, Button, Message } from 'element-ui'

Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Button)
// 挂载到Vue 原型对象
Vue.prototype.$message = Message // 在组件中可通过this 访问 $message 进行弹窗提示
