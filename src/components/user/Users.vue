<template>
	<div>
		<!-- 面包屑导航区域 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>用户管理</el-breadcrumb-item>
			<el-breadcrumb-item>用户列表</el-breadcrumb-item>
		</el-breadcrumb>

		<!-- 卡片视图区域 -->
		<el-card>
			<!-- 搜索与添加区域 -->
			<el-row :gutter="20">
				<el-col :span="8">
					<!-- 实现搜索功能 数据的双向绑定,搜索按钮绑定单击事件（更新用户列表函数）-->
					<!-- 使用clearable属性即可得到一个可清空的输入框 -->
					<!-- clear	在点击由 clearable 属性生成的清空按钮时触发 -->
					<el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
						<el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
					</el-input>
				</el-col>
				<el-col :span="4">
					<el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
				</el-col>
			</el-row>

			<!-- 用户列表区域 -->
			<el-table :data="userlist" border stripe>
				<!-- 添加索引列 ： type="index"-->
				<el-table-column type="index" label="#"> </el-table-column>
				<el-table-column prop="username" label="姓名"></el-table-column>
				<el-table-column prop="email" label="邮箱"> </el-table-column>
				<el-table-column prop="mobile" label="电话"> </el-table-column>
				<el-table-column prop="role_name" label="角色"> </el-table-column>
				<el-table-column label="状态">
					<!-- mg_state 属性 是布尔值，布尔值不能直接渲染在页面，要将其渲染成开关的状态并显示 -->
					<!-- 使用 作用域插槽 接收scope，scope.row 是这一行的数据 -->
					<template slot-scope="scope">
						<el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="180">
					<!-- 通过作用域插槽渲染操作列 -->
					<template slot-scope="scope">
						<!-- 修改按钮 -->
						<el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
						<!-- 删除按钮 -->
						<el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
						<!-- 分配角色按钮 enterable	鼠标是否可进入到 tooltip 中 -->
						<el-tooltip content="分配角色" placement="top" :enterable="false">
							<el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
						</el-tooltip>
					</template>
				</el-table-column>
			</el-table>

			<!-- 分页区域 -->
			<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
			</el-pagination>
		</el-card>

		<!-- 添加用户的对话框 -->
		<!-- close事件	Dialog 关闭的回调 -->
		<el-dialog title="提示" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">

			<!-- 内容主体区域 -->
			<!-- (ref 是引用，通过ref可以拿到表单的实例对象（ref的值就是表单的实例对象）) -->
			<el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
				<el-form-item label="用户名" prop="username">
					<el-input v-model="addForm.username"></el-input>
				</el-form-item>
				<el-form-item label="密码" prop="password">
					<el-input v-model="addForm.password"></el-input>
				</el-form-item>
				<el-form-item label="邮箱" prop="email">
					<el-input v-model="addForm.email"></el-input>
				</el-form-item>
				<el-form-item label="手机" prop="mobile">
					<el-input v-model="addForm.mobile"></el-input>
				</el-form-item>
			</el-form>

			<span slot="footer" class="dialog-footer">
				<el-button @click="addDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="addUser">确 定</el-button>
			</span>
		</el-dialog>

		<!-- 修改用户的对话框 -->
		<el-dialog title="修改用户信息" :visible.sync="editDialogVisible" width="50%" @click="editDialogClosed">

			<!-- 内容主体区域 -->
			<!--  Form-Item 的 prop 属性设置为需校验的字段名即可 -->
			<!-- v-model 数据绑定的值editForm.email是由后台查询的数据决定的 -->
			<el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
				<el-form-item label="用户名">
					<el-input v-model="editForm.username" disabled></el-input>
				</el-form-item>
				<el-form-item label="邮箱" prop="email">
					<el-input v-model="editForm.email"></el-input>
				</el-form-item>
				<el-form-item label="手机" prop="mobile">
					<el-input v-model="editForm.mobile"></el-input>
				</el-form-item>
			</el-form>

			<span slot="footer" class="dialog-footer">
				<el-button @click="editDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="editUserInfo">确 定</el-button>
			</span>
		</el-dialog>

		<!-- 分配角色的对话框 -->
		<el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%" @close="setRoleDialogClosed">
			<div>
				<p>当前的用户：{{userInfo.username}}</p>
				<p>当前的角色：{{userInfo.role_name}}</p>
				<p>分配新角色：
					<el-select v-model="selectedRoleId" placeholder="请选择">
						<el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id">
						</el-option>
					</el-select>
				</p>
			</div>

			<span slot="footer" class="dialog-footer">
				<el-button @click="setRoleDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="saveRoleInfo">确 定</el-button>
			</span>
		</el-dialog>

	</div>
</template>

<script>
	export default {
		data () {
			// 自定义检验规则
			// （1）验证邮箱的规则
			var checkEmail = (rule, value, callback) => {
				// 验证邮箱的正则表达式
				const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
				if (regEmail.test(value)) {
					// 合法的邮箱
					return callback()
				}
				callback(new Error('请输入合法的邮箱'))
			}

			// （2）验证手机号的规则
			var checkMobile = (rule, value, callback) => {
				// 验证手机号的正则表达式
				const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
				if (regMobile.test(value)) {
					// 合法的手机号
					return callback()
				}
				callback(new Error('请输入合法的手机号'))
			}

			return {
				// 获取用户列表的参数对象
				queryInfo: {
					query: '',
					pagenum: 1,  // 当前的页数
					pagesize: 2   // 当前每页显示多少条数据
				},
				// 用户数据列表
				userlist: [],
				total: 0,

				// 控制添加用户对话框的显示与隐藏
				addDialogVisible: false,

				// 添加用户的表单数据
				addForm: {
					username: '',
					password: '',
					email: '',
					mobile: ''
				},
				// 添加表单的验证规则对象
				addFormRules: {
					username: [
						{ required: true, message: '请输入用户名', trigger: 'blur' },
						{ min: 3, max: 10, message: '用户名的长度在 3 到 10 个字符', trigger: 'blur' }
					],
					password: [
						{ required: true, message: '请输入密码', trigger: 'blur' },
						{ min: 6, max: 15, message: '密码的长度在 6 到 15 个字符', trigger: 'blur' }

					],
					email: [
						{ required: true, message: '请输入邮箱', trigger: 'blur' },
						{ validator: checkEmail, triggle: 'blur' }
					],
					mobile: [
						{ required: true, message: '请输入手机号', trigger: 'blur' },
						{ validator: checkMobile, triggle: 'blur' }
					]
				},

				// 控制修改用户对话框的显示与隐藏
				editDialogVisible: false,
				// 查询到的用户信息对象
				editForm: {},
				// 修改表单的验证规则对象
				editFormRules: {
					email: [
						{ required: true, message: '请输入用户邮箱', trigger: 'blur' },
						{ validator: checkEmail, trigger: 'blur' }
					],
					mobile: [
						{ required: true, message: '请输入用户手机', trigger: 'blur' },
						{ validator: checkMobile, trigger: 'blur' }
					]
				},
				// 控制分配角色对话框的显示与隐藏
				setRoleDialogVisible: false,
				// 需要被分配的角色的用户信息
				userInfo: {},
				// 所有角色的数据列表
				rolesList: [],   //TODO 把数据列表的数组渲染成分配新角色的 下拉菜单
				// 已选中的角色Id值
				selectedRoleId: ''

			}
		},


		created () {
			this.getUserList();
		},

		methods: {
			async getUserList () {
				const { data: res } = await this.$http.get('users', { params: this.queryInfo })
				if (res.meta.status !== 200) {
					return this.$message.error('获取用户列表失败！');
				}
				this.userlist = res.data.users; // 后台响应的用户数据存入用户列表
				this.total = res.data.total;   // 后台响应的总记录数存入总数
				console.log(res);
			},


			// 监听 pagesize 改变的事件  当前每页显示多少条数据
			handleSizeChange (newSize) {
				// console.log(newSize)
				this.queryInfo.pagesize = newSize;  // 赋值给当前每页显示多少条数据
				this.getUserList();  // 重新发送请求获取数据列表
			},


			// 监听 页码值 改变的事件
			handleCurrentChange (newPage) {
				// console.log(newPage)
				this.queryInfo.pagenum = newPage;  // 给当前的页码值赋值
				this.getUserList();
			},


			// 监听用户状态改变（switch开关）的事件
			// 函数形参 ： 用户信息 ，实参 在switch 开关里传入用户信息scope.row    用户状态的布尔值是 scope.row.mg_state。
			async userStateChanged (userinfo) {
				console.log(userinfo) // 开关开启 为 true
				// 拿到新状态后，发起Ajax请求，调用接口，把状态赋值给服务器
				// this.$http.put('users/:uId/state/:type')  
				// 路径要拼接动态参数，可用模板字符串表示
				const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
				if (res.meta.status !== 200) {
					userinfo.mg_state = !userinfo.mg_state
					return this.$message.error('更新用户状态失败！')
				}
				this.$message.success('更新用户状态成功！')
				// (注意：) $message 是挂载到Vue原型上的属性, 通过 $message 可使用 Message 组件提供的方法
			},


			// 监听添加用户对话框的关闭事件
			addDialogClosed () {
				// resetFields	对整个表单进行重置，将所有字段值重置为初始值并移除校验结果
				console.log(this);
				this.$refs.addFormRef.resetFields() // this.$refs 是定义表单的引用对象，此引用对象就是此组件的实例对象
			},


			// 点击按钮，添加新用户
			// 添加用户前的表单预校验
			addUser () {
				this.$refs.addFormRef.validate(async valid => {
					if (!valid) return
					// 发起添加用户的网络请求
					const { data: res } = await this.$http.post('users', this.addForm)
					if (res.meta.status !== 201) {
						res.$message.error('添加用户失败！')
					}
					this.$message.success('添加用户成功！')
					// 隐藏添加用户的对话框
					this.addDialogVisible = false
					// 重新获取用户列表数据
					this.getUserList()
				})
			},


			// 展示编辑用户的对话框
			// 根据 id 查询对应的用户信息 形参：id   实参：scope.row.id
			async showEditDialog (id) {
				// console.log(id)
				// 调用 根据ID查询用户信息的接口
				const { data: res } = await this.$http.get('users/' + id)
				if (res.meta.status !== 200) {
					return this.$message.error('查询用户信息失败！')
				}
				this.$message.success('查询用户信息成功！')
				this.editForm = res.data;  // 将后台查询到的用户信息赋值给定义的editForm数据
				this.editDialogVisible = true  //  显示修改用户信息的对话框
			},


			// 监听修改用户对话框的关闭事件
			editDialogClosed () {
				this.$refs.editFormRef.resetFields();  // 修改表单用户的重置事件  
			},


			// 修改用户信息并提交
			editUserInfo () {
				this.$refs.editFormRef.validate(async valid => {
					if (!valid) return
					// 发起修改用户信息的数据请求    users/:id  id是在定义的查询到的用户信息对象editForm中取到的
					const { data: res } = await this.$http.put('users/' + this.editForm.id, {
						email: this.editForm.email,
						mobile: this.editForm.mobile
					})
					if (res.meta.status !== 200) {
						return this.$message.error('更新用户信息失败！')
					}
					// 关闭对话框
					this.editDialogVisible = false
					// 刷新数据列表
					this.getUserList()
					// 提示修改成功
					this.$message.success('更新用户信息成功！')
				})
			},


			// 根据Id删除对应的用户信息
			async removeUserById (id) {
				// 弹窗询问用户是否删除数据
				const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).catch(err => err)  // catch() 进行错误捕获(用户取消行为)， return 只有一行，可省略大括号和return

				// console.log(confirmResult);
				// 如果用户"确认"删除，则返回值为字符串 confirm
				// 如果用户"取消"了删除，则返回值为字符串 cancel
				if (confirmResult !== 'confirm') {
					return this.$message.info('已取消删除')
				}
				// 调用API完成删除用户的操作
				const { data: res } = await this.$http.delete('users/' + id)
				if (res.meta.status !== 200) {
					return this.$message.error('删除用户信息失败！')
				}
				this.$message.success('删除用户成功！')
				this.getUserList()
			},


			// 展示分配角色的对话框
			async setRole (userInfo) { // 此处传来的userInfo是scope.row
				this.userInfo = userInfo  // 把点击按钮得到的用户信息userInfo保存在需要被分配的角色的用户信息this.userInfo上
				// console.log(userInfo);
				// 在展示对话框之前，获取所有角色的列表
				const { data: res } = await this.$http.get('roles')
				if (res.meta.status !== 200) {
					return this.$message.error('获取角色列表失败！')
				}
				this.rolesList = res.data
				// console.log(res.data);
				this.setRoleDialogVisible = true
			},


			// 点击按钮，分配角色 
			async saveRoleInfo () {
				if (!this.selectedRoleId) {
					return this.$message.error('请选择要分配的角色！')
				}
				// 发起请求分配用户角色
				const { data: res } = await this.$http.put(
					`users/${this.userInfo.id}/role`, { rid: this.selectedRoleId }
				)
				if (res.meta.status !== 200) {
					return this.$message.error('更新角色失败！')
				}
				this.$message.success('更新角色成功！')
				this.getUserList()
				this.setRoleDialogVisible = false
			},


			// 监听分配角色对话框的关闭事件
			setRoleDialogClosed () {
				this.selectedRoleId = ''
				this.userInfo = {}
			}


		}
	}

</script>

<style scoped>
</style>