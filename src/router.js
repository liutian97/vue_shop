import Vue from 'vue'
import Router from 'vue-router'
// 将登录组件 在 router.js 中通过路由的形式渲染到 App根组件中
import Login from './components/Login.vue' // 导入登录组件
import Home from './components/Home.vue' // 导入主页组件

Vue.use(Router)

const router = new Router({
  routes: [
    // 渲染Login组件并实现路由重定向
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    { path: '/home', component: Home }
  ]
})

// 挂载路由导航守卫控制访问权限

// to 将要访问的路径
// from 代表从哪个路径跳转而来
// next 是一个函数，表示放行
//     next()  放行    next('/login')  强制跳转

// 为路由对象，添加 beforeEach 导航守卫
router.beforeEach((to, from, next) => {
  // 如果用户访问的登录页，直接放行
  if (to.path === '/login') return next()
  // 从 sessionStorage 中获取到 保存的 token 值
  const tokenStr = window.sessionStorage.getItem('token')
  // 没有token，强制跳转到登录页
  if (!tokenStr) return next('/login')
  // 有token， 放行
  next()
})

export default router
