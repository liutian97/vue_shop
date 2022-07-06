import Vue from 'vue'
import Router from 'vue-router'
// 将登录组件 在 router.js 中通过路由的形式渲染到 App根组件中
import Login from './components/Login.vue' // 导入登录组件
import Home from './components/Home.vue' // 导入主页组件
import Welcome from './components/Welcome.vue' // 导入欢迎组件
import Users from './components/user/Users.vue' // 导入用户列表组件
Vue.use(Router)

const router = new Router({
  routes: [
    // 渲染Login组件并实现路由重定向
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    // 渲染Home组件
    // 点击登录会跳转到 home 页面，然后重定向到 welcome 页面，在 Home 组件 的 占位符上体现出 Welcome 组件
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: Users }
      ]
    }
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
