<template>
	<el-container class="home-container">
		<!-- 头部区域 -->
		<el-header>
			<div>
				<img src="../assets/heima.png" alt="" />
				<span>电商后台管理系统</span>
			</div>
			<el-button type="info" @click="logout">退出</el-button>
		</el-header>
		<!-- 页面主题区域 -->
		<el-container>
			<!-- 侧边栏 -->
			<!-- 根据是否折叠动态为侧边栏设置宽度 -->
			<el-aside :width="isCollapse ? '64px' : '200px'">
				<!-- 侧边栏折叠展开按钮 -->
				<div class="toggle-button" @click="toggleCollapse">|||</div>
				<!-- 侧边栏菜单区域 -->
				<!-- 优化处理：每次只能打开一个菜单项并解决边框问题 -->
				<!-- unique-opened 属性	是否只保持一个子菜单的展开- -->
				<!-- collapse 属性 是否水平折叠收起菜单 -->
				<!-- collapse-transition	是否开启折叠动画 -->
				<!-- 是否使用 vue-router 的模式，启用该模式会在激活导航时以 index 作为 path 进行路由跳转 -->
				<!-- default-active	当前激活菜单的 index -->
				<el-menu background-color="#333744" text-color="#fff" active-text-color="#409EFF" :unique-opened="true" :collapse="isCollapse" :collapse-transition="false" :router="true" :default-active="activePath">
					<!-- 一级菜单 -->
					<!-- 外层 for 循环渲染左侧菜单的一级列表 -->
					<!-- item.id 是数值，加空字符串 可以转换为字符串 -->
					<el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
						<!-- 一级菜单的模板区域 -->
						<template slot="title">
							<!-- 图标  根据id动态绑定图标-->
							<i :class="iconsObj[item.id]"></i>
							<!-- 文本 -->
							<span>{{ item.authName }}</span>
						</template>

						<!-- 二级菜单 -->
						<!-- 侧边栏路由链接 index 作为 path 进行路由跳转 -->
						<el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/' + subItem.path)">
							<template slot="title">
								<!-- 图标 -->
								<i class="el-icon-menu"></i>
								<!-- 文本 -->
								<span>{{ subItem.authName }}</span>
							</template>
						</el-menu-item>
					</el-submenu>
				</el-menu>
			</el-aside>
			<!-- 右侧内容主体 -->
			<el-main>
				<!-- 路由占位符   在 Home 组件 展示 Welcome 组件（作为Home组件的孩子）-->
				<router-view></router-view>
			</el-main>
		</el-container>
	</el-container>
</template>

<script>
	export default {
		data () {
			return {
				// (1) 获取左侧菜单数据
				menulist: [],
				// 在 <template></template> 中用两层 for 循环渲染左侧菜单
				// (2) 添加分类图标
				iconsObj: {
					// 以数据的id作为键，字体图标作为值
					'125': 'iconfont icon-user',
					'103': 'iconfont icon-tijikongjian',
					'101': 'iconfont icon-shangpin',
					'102': 'iconfont icon-danju',
					'145': 'iconfont icon-baobiao'
				},
				// 是否折叠
				isCollapse: false,

				// 定义数组，保存激活的链接地址
				activePath: ''

			}
		},

		// created 在实例创建完成后被立即调用
		created () {
			this.getMenuList()  // 获取菜单列表
			this.activePath = window.sessionStorage.getItem('activePath') // 将 保存在 sessionStorage 的激活状态进行赋值
		},



		methods: {
			// 退出功能
			logout () {
				// （1）清空token
				window.sessionStorage.clear()
				// （2）跳转到登录页
				this.$router.push('/login')
			},

			// 获取左侧菜单数据
			// (1) 调接口获取数据列表
			async getMenuList () {
				const { data: res } = await this.$http.get('menus')
				if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
				this.menulist = res.data
				console.log(res);
			},

			// 点击按钮，切换菜单的展开与折叠
			toggleCollapse () {
				this.isCollapse = !this.isCollapse
			},

			// 二级菜单绑定单击事件，用于保存左侧菜单的激活状态
			saveNavState (activePath) {
				window.sessionStorage.setItem('activePath', activePath);
				this.activePath = activePath;
			}
		}
	}
</script>


<style lang="less" scoped>
	// 组件名称就是类名
	.home-container {
		height: 100%;
	}
	.el-header {
		background-color: #373d41;
		display: flex;
		justify-content: space-between; // 设置主轴子元素排列
		align-items: center; // 设置侧轴子元素排列(纵向居中，默认x轴为主轴)
		padding-left: 0;
		color: #fff;
		font-size: 20px;
		// 给左侧图片和文字的div前套加弹性布局
		> div {
			display: flex;
			align-items: center;
			span {
				margin-left: 15px;
			}
		}
	}
	.el-aside {
		background-color: #333744;
		// 解决选中的右侧边框线对不齐
		.el-menu {
			border-right: none;
		}
	}
	.el-main {
		background-color: #eaedf1;
	}

	// 图标与文本的间距
	.iconfont {
		margin-right: 10px;
	}

	// 折叠展开按钮
	.toggle-button {
		background-color: #4a5064;
		color: #fff;
		font-size: 10px;
		line-height: 24px;
		text-align: center;
		cursor: pointer;
		letter-spacing: 0.2em;
	}
</style>