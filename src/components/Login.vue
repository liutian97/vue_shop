<!-- Login.vue 为单文件组件 -->
<template>
	<div class="login_container">
		<div class="login_box">
			<!-- 头像区域 -->
			<div class="avatar">
				<img src="../assets/logo.png" alt="" />
			</div>
			<!-- 登录表单区域 -->
			<!-- 数据绑定：(1) :model属性绑定，值是对象,在data在做定义
      (2) 在 每个表单项绑定数据的某个属性 -->
			<!-- 通过 ref 标注 DOM 元素 -->
			<el-form :model="loginForm" :rules="loginFormRules" ref="loginFormRef" label-width="0px" class="login_form">
				<!-- 用户名 -->
				<el-form-item prop="username">
					<el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
				</el-form-item>
				<!-- 密码 -->
				<el-form-item prop="password">
					<el-input v-model="loginForm.password" prefix-icon="iconfont icon-3702mima" type="password"></el-input>
				</el-form-item>
				<!-- 按钮区域 -->
				<el-form-item class="btns">
					<el-button type="primary" @click="login">登录</el-button>
					<el-button type="info" @click="resetLoginForm">重置</el-button>
				</el-form-item>
			</el-form>
		</div>
	</div>
</template>

<script>
	export default {
		data () {
			return {
				// 登录表单的数据绑定对象
				loginForm: {
					username: 'admin',
					password: '123456'
				},
				// 表单的验证规则对象
				loginFormRules: {
					// 验证用户名是否合法
					username: [
						{ required: true, message: '请输入登录名称', trigger: 'blur' },
						{ min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
					],
					// 验证密码是否合法
					password: [
						{ required: true, message: '请输入登录密码', trigger: 'blur' },
						{ min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
					]
				}
			}
		},
		methods: {
			// 点击重置按钮，重置登录表单
			resetLoginForm () {
				// console.log(this); // 组件实例
				// 通过 Vue 实例的 $refs 属性 获取标记 ref 属性的元素（表单的引用对象loginFormRef）
				this.$refs.loginFormRef.resetFields();  // resetFields 是 Element-ui 定义的表单重置的方法。
			},
			// 登录
			login () {
				//  axios 发起登录请求前进行校验  // validate() 对整个表单进行校验的方法，参数为一个回调函数
				// this.$refs.loginFormRef.validate(valid => {
				// console.log(valid); // valid 为 true，验证成功
				// 判断是否验证成功可以发起 axios 登录请求 
				// if (!valid) return
				// 验证成功，配置 axios 发起登录请求(main.js文件中进行)
				// const result = this.$http.post('login', this.loginForm) // 测试前需要开启数据库MySQL和后台接口app.js
				// console.log(result); // Promise {<pending>}
				// (注意：)返回值是Promise实例对象,可以使用async/await
				// });

				this.$refs.loginFormRef.validate(async valid => {
					if (!valid) return
					// const result = await this.$http.post('login', this.loginForm)
					// console.log(result); // 具体的响应对象 {data: {…}, status: 200, statusText: 'OK', headers: {…}, config: {…}, …}
					// 	// 解构出真实数据
					const { data: res } = await this.$http.post('login', this.loginForm)
					if (res.meta.status !== 200) return this.$message.error('登录失败！');
					this.$message.success('登录成功！')
					// 1. 将登录成功之后的 token，保存到客户端的 sessionStorage 中
					//   1.1 项目中出了登录之外的其他API接口，必须在登录之后才能访问
					//   1.2 token 只应在当前网站打开期间生效，所以将 token 保存在 sessionStorage 中
					window.sessionStorage.setItem('token', res.data.token);
					// 2. 通过编程式导航跳转到后台主页，路由地址是 /home
					this.$router.push("/home")

				})
			}
		}
	}
</script>

<style lang="less" scope>
	// scope 防止组件之间的样式冲突
	// 设置背景色并在屏幕中央绘制登录盒子
	.login_container {
		background-color: #2b4b6b;
		height: 100%;
	}
	.login_box {
		background-color: #fff;
		height: 300px;
		width: 450px;
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
	}
	// 绘制默认头像
	.avatar {
		height: 130px;
		width: 130px;
		border: 1px solid #eee;
		border-radius: 50%;
		padding: 10px;
		box-shadow: 0 0 10px #ddd;
		// 头像在盒子里水平垂直居中
		// (1) 定位 + 盒子外边距 实现 (会影响其他元素的位置)
		position: absolute;
		left: 50%;
		// margin-left: -65px;
		// margin-top: -65px;
		// (2) 使用 transform 的 translate 进行移动 (不会影响其他元素的位置), 参数的百分比是相对于元素自身的。
		transform: translate(-50%, -50%);

		img {
			width: 100%;
			height: 100%;
			border-radius: 50%;
			background-color: #eee;
		}
	}
	// 登录表单区域
	.login_form {
		position: absolute;
		bottom: 0;
		width: 100%;
		padding: 0 20px;
		box-sizing: border-box;
	}
	.btns {
		display: flex;
		// justify-content设置主轴子元素排列
		justify-content: flex-end;
	}
</style>