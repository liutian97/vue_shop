<template>
	<div>
		<!-- 面包屑导航区域 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>权限管理</el-breadcrumb-item>
			<el-breadcrumb-item>角色列表</el-breadcrumb-item>
		</el-breadcrumb>

		<!-- 卡片视图区域 -->
		<el-card>
			<!-- 添加角色列表区域 -->
			<el-row>
				<el-col>
					<el-button type="primary">添加角色</el-button>
				</el-col>
			</el-row>

			<!-- 角色列表区域 -->
			<el-table :data="rolelist" border stripe>
				<!-- 展开列   如果设置了 expand 则显示为一个可展开的按钮 -->
				<el-table-column type="expand">
					<!-- 使用作用域插槽来渲染权限列表 -->
					<template slot-scope="scope">
						<!-- 上边框线动态添加，索引i1为0，添加上边框线，不为0，不添加 -->
						<el-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
							<!-- 渲染一级权限 -->
							<el-col :span="5">
								<el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
								<i class="el-icon-caret-right"></i>
							</el-col>
							<!-- 渲染二级和三级权限 -->
							<el-col :span="19">
								<!-- 通过for循环嵌套渲染二级权限 -->
								<el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
									<el-col :span="6">
										<el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{item2.authName}}</el-tag>
										<i class="el-icon-caret-right"></i>
									</el-col>
									<!-- 通过for循环嵌套渲染三级权限 -->
									<!-- closable	是否可关闭 -->
									<!-- close	关闭 Tag 时触发的事件 -->
									<!-- removeRightById(scope.row, items.id), scope.row 是角色id，items.id 是权限id -->
									<el-col :span="13">
										<el-tag v-for="(item3, i3) in item2.children" :key="item3.id" type="warning" closable @close="removeRightById(scope.row, item3.id)">{{item3.authName}}</el-tag>
									</el-col>
								</el-row>
							</el-col>
						</el-row>
						<pre>
              {{scope.row}}
            </pre>
					</template>
				</el-table-column>
				<!-- 索引列 -->
				<el-table-column type="index" label="#"></el-table-column>
				<el-table-column prop="roleName" label="角色名称"></el-table-column>
				<el-table-column prop="roleDesc" label="角色描述"></el-table-column>
				<el-table-column label="操作" width="300px">
					<!-- 通过作用域插槽渲染操作列 -->
					<template slot-scope="scope">
						<!-- 修改按钮 -->
						<el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
						<!-- 删除按钮 -->
						<el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
						<!-- 分配权限按钮  showSetRightDialog(scope.row) 参数scope.row 传入到递归获取三级节点的Id的递归函数中-->
						<el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
					</template>
				</el-table-column>
			</el-table>

		</el-card>

		<!-- 分配权限的对话框 -->
		<el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
			<!-- 树形控件 -->
			<!-- show-checkbox	节点是否可被选择 -->
			<!-- node-key	每个树节点用来作为唯一标识的属性，整棵树应该是唯一的 -->
			<!-- default-expand-all	是否默认展开所有节点 -->
			<!-- default-checked-keys	默认勾选的节点的 key 的数组 -->
			<el-tree :data="rightslist" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
			<span slot="footer" class="dialog-footer">
				<el-button @click="setRightDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="allotRights">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
	export default {
		data () {
			return {
				// 所有角色列表数据
				rolelist: [],
				// 控制分配权限对话框的显示与隐藏
				setRightDialogVisible: false,   // el-dialog 标签 对应的属性值，需要在数据里定义
				// 所有权限的数据
				rightslist: [],
				// 树形控件的属性绑定对象
				treeProps: {
					label: 'authName',
					children: 'children'
				},
				// 默认选中的节点Id值数组
				defKeys: [],
				// 当前即将分配权限的角色id
				roleId: ''


			}
		},

		// 生命周期函数 
		created () {
			this.getRolesList()
		},

		methods: {
			// 获取所有角色的列表
			async getRolesList () {
				const { data: res } = await this.$http.get('roles')
				if (res.meta.status !== 200) {
					return this.$message.error('获取角色列表失败！')
				}
				this.rolelist = res.data  // 把后台获取的数据保存在定义的数据中
				console.log(this.rolelist)
			},


			// 根据Id删除对应的权限
			async removeRightById (role, rightId) {    // role 是包含角色id，rightId 是权限id
				// 弹框询问用户是否要删除
				const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).catch(err => err)

				if (confirmResult !== 'confirm') {
					return this.$message.info('取消了删除')
				}
				// 删除角色指定权限    roles/:roleId/rights/:rightId
				const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
				if (res.meta.status !== 200) {
					return this.$message.error('删除权限失败！')
				}
				// 提高用户体验，不要直接刷新角色列表
				// this.getRolesList()
				role.children = res.data  // 服务器返回的data, 是当前角色下最新的权限数据
			},


			// 展示分配权限的对话框   rights/:type
			async showSetRightDialog (role) {
				this.roleId = role.id
				// 获取所有权限的数据
				const { data: res } = await this.$http.get('rights/tree')
				if (res.meta.status !== 200) {
					return this.$message.error('获取权限列表失败！')
				}
				// 把获取到的权限数据保存到 data 中
				this.rightslist = res.data
				console.log(this.rightslist);

				// 递归获取三级节点的Id  （点击按钮的showSetRightDialog函数里的scope.row会传入role）
				this.getLeafKeys(role, this.defKeys)

				// 显示点击“分配权限”显示对话框
				this.setRightDialogVisible = true;
			},

			// 定义递归函数，通过递归的形式，获取角色下所有三级权限的id，并保存到 defKeys 数组中
			// node 判断是否为三级节点， arr 数组进行保存
			getLeafKeys (node, arr) {
				// 如果当前 node 节点不包含 children 属性，则是三级节点
				if (!node.children) {
					return arr.push(node.id)
				}
				// 如果不是三级节点，进一步进行递归获取三级节点
				node.children.forEach(item =>
					this.getLeafKeys(item, arr)
				)
			},

			// 监听分配权限对话框的关闭事件
			setRightDialogClosed () {
				this.defKeys = []  // 每次点完“分配权限”按钮后，清空默认选中的节点Id值数组
			},


			// 点击为角色分配权限
			async allotRights () {
				// 获取所有选中节点的id
				// ... 扩展运算符
				const keys = [
					...this.$refs.treeRef.getCheckedKeys(),  // 全选节点的 key 所组成的数组
					...this.$refs.treeRef.getCheckedKeys()	// 半选节点的 key 所组成的数组
				]
				// 把数组进行拼接成字符串发起请求
				const idStr = keys.join(',')

				const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
				if (res.meta.status !== 200) {
					return this.$message.error('分配权限失败！')
				}
				this.$message.success("分配权限成功！")
				this.getRolesList()
				this.setRightDialogVisible = false
			},





		}

	}


</script>

<style lang="less" scoped>
	.el-tag {
		margin: 7px;
	}

	.bdtop {
		border-top: 1px solid #eee;
	}

	.bdbottom {
		border-bottom: 1px solid #eee;
	}

	// 三级权限的样式
	.vcenter {
		display: flex;
		align-items: center; // 侧轴元素的排列方式：纵轴居中对齐
	}
</style>