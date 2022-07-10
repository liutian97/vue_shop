<template>
	<div>
		<!-- 面包屑导航区域 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>商品管理</el-breadcrumb-item>
			<el-breadcrumb-item>参数列表</el-breadcrumb-item>
		</el-breadcrumb>

		<!-- 卡片视图区域 -->
		<el-card>
			<!-- 警告区域 -->
			<el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon :closable="true">
			</el-alert>
			<!-- 选择商品分类区域 -->
			<el-row class="cat_opt">
				<el-col>
					<span>选择商品分类：</span>
					<!-- 选择商品分类的级联选择框 -->
					<!--  v-model	选中项绑定值  可把级联选择器中选中的值双向绑定在数组中 -->
					<!-- options	可选项数据源（数组），键名可通过 Props 属性配置 -->
					<!-- props  级联选择框的配置对象 -->
					<!-- change	当选中节点变化时触发 -->
					<el-cascader v-model="selectedCateKeys" :options="catelist" :props="cateProps" @change="handleChange"></el-cascader>

				</el-col>
			</el-row>

			<!-- tab 页签区域 -->
			<!-- v-model  绑定值，选中选项卡的 name -->
			<el-tabs v-model="activeName" @tab-click="handleTabClick">

				<!-- 添加“动态参数”的面板 -->
				<el-tab-pane label="动态参数" name="many">
					<!-- “添加参数”的按钮 -->
					<!-- 使用disabled属性来定义按钮是否可用，它接受一个Boolean值。 -->
					<el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加参数</el-button>

					<!-- 动态参数表格 -->
					<el-table :data="manyTableData" style="width: 100%" border stripe>
						<!-- 展开行 -->
						<el-table-column type="expand">
							<!-- 作用域 -->
							<template slot-scope="scope">
								<!-- 循环渲染Tag标签 -->
								<el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
								<!-- 动态可编辑的标签 -->
								<!-- 输入的文本框 -->
								<el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
								</el-input>
								<!-- 添加按钮 -->
								<el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
							</template>
						</el-table-column>
						<!-- 索引列 -->
						<el-table-column type="index" label="#"></el-table-column>
						<el-table-column prop="attr_name" label="参数名称"></el-table-column>
						<el-table-column label="操作">
							<!-- 使用作用域插槽 自定义模板列渲染表格数据   -->
							<template slot-scope="scope">
								<el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
								<el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
							</template>
						</el-table-column>
					</el-table>

				</el-tab-pane>

				<!-- 添加“静态属性”的面板 -->
				<el-tab-pane label="静态属性" name="only">
					<!-- “添加属性”的按钮 -->
					<el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加属性</el-button>

					<!-- 静态属性表格 -->
					<el-table :data="onlyTableData" style="width: 100%" border stripe>
						<!-- 展开行 -->
						<el-table-column type="expand">
							<!-- 作用域 -->
							<template slot-scope="scope">
								<!-- 循环渲染Tag标签 -->
								<el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
								<!-- 动态可编辑的标签 -->
								<!-- 输入的文本框 -->
								<el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
								</el-input>
								<!-- 添加按钮 -->
								<el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
							</template>
						</el-table-column>
						<!-- 索引列 -->
						<el-table-column type="index" label="#"></el-table-column>
						<el-table-column prop="attr_name" label="属性名称"></el-table-column>
						<el-table-column label="操作">
							<!-- 使用作用域插槽 自定义模板列渲染表格数据   -->
							<template slot-scope="scope">
								<el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
								<el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
							</template>
						</el-table-column>
					</el-table>
				</el-tab-pane>

			</el-tabs>

		</el-card>

		<!-- “添加参数” 的对话框 -->
		<!-- (注意： 动态绑定的属性前面一定要加 ：) -->
		<el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
			<!-- “添加参数” 的表单 -->
			<el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
				<el-form-item :label="titleText" prop="attr_name">
					<el-input v-model="addForm.attr_name"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="addDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="addParams">确 定</el-button>
			</span>
		</el-dialog>

		<!-- “修改参数” 的对话框 -->
		<el-dialog :title="'修改' + titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
			<!-- “修改参数” 的表单 -->
			<el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
				<el-form-item :label="titleText" prop="attr_name">
					<el-input v-model="editForm.attr_name"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="editDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="editParams">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
	export default {
		data () {
			return {
				// 商品分类列表数据
				catelist: [],
				// 级联选择框的配置对象
				cateProps: {
					expandTrigger: 'hover', // expandTrigger	次级菜单的展开方式
					value: 'cat_id',  // value	指定选中的值
					label: 'cat_name',  // label  指定级联选择器中看到的值
					children: 'children' // children 指定父子嵌套的值
				},
				// 级联选择框双向绑定到的数组
				selectedCateKeys: [],
				// 被激活的Tabs页签的名称
				activeName: 'many',
				// 动态参数的数据 
				manyTableData: [],
				// 静态属性的数据
				onlyTableData: [],
				// 控制添加对话框的显示与隐藏
				addDialogVisible: false,
				// 添加参数的表单数据对象
				addForm: {
					attr_name: ''
				},
				// 添加表单的验证规则对象
				addFormRules: {
					attr_name: [
						{ required: true, message: '请输入参数名称', trigger: 'blur' }
					],
				},
				// 控制修改对话框的显示与隐藏
				editDialogVisible: false,
				// 修改的表单数据对象
				editForm: {},
				// 修改表单的验证规则对象
				editFormRules: {
					attr_name: [
						{ required: true, message: '请输入参数名称', trigger: 'blur' }
					],
				},
				// // 控制按钮与文本框的切换显示
				// inputVisible: false,
				// // 文本框中输入的内容
				// inputValue: ''
			}
		},

		created () {
			this.getCateList()

		},

		methods: {
			// 获取所有商品分类数据列表  categories
			async getCateList () {
				const { data: res } = await this.$http.get('categories')
				if (res.meta.status !== 200) {
					return this.$message.error('获取商品分类列表失败！')
				}
				this.catelist = res.data
				console.log(this.catelist);
			},


			// 级联选择框选中项变化，会触发这个函数
			handleChange () {
				// 触发获取参数的列表
				this.getParamsData()
			},


			// tab 页签点击事件的处理函数
			handleTabClick () {
				console.log(this.activeName);
				// 触发获取参数的列表
				this.getParamsData()
			},


			// 获取参数的列表数据
			async getParamsData () {
				// 控制级联选择器的选中范围（要求选中的只能是三级分类）
				// 证明选中的不是三级分类
				if (this.selectedCateKeys.length != 3) {
					this.selectedCateKeys = []  // 清空级联选择器的数组
					this.manyTableData = []  // 清空动态参数的数据 
					this.onlyTableData = []  // 清空静态属性的数据
					return
				}
				// 证明选中的是三级分类
				console.log(this.selectedCateKeys);

				// 发起请求获取参数列表数据  categories/:id/attributes
				// 根据所选分类的Id，和当前所处的面板，获取对应的参数
				const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`,
					{ params: { sel: this.activeName } })
				if (res.meta.status !== 200) {
					return res.$message.error('获取参数列表失败！')
				}
				// console.log(res.data);

				//  将后台返回的数据进行遍历，拿到的每一项的 attt_vals 字符串转为数组后  在展开行中渲染成tag标签()
				res.data.forEach(item => {
					// 用三元表达式 判断 解决 attr_vals 为空字符串时的问题
					item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
					// 为每一行数据提供单独的 inputVisible 和 inputValue
					// 控制文本框的显示与隐藏
					item.inputVisible = false
					// 文本框中输入的值
					item.inputValue = ''  // TODO:绑定在template 的scope.row上
				});
				console.log(res.data);



				// 判断 后台返回的 res.data 是 “动态参数” 表格下 还是 “静态属性” 表格下 的 数据
				if (this.activeName === 'many') {
					this.manyTableData = res.data    // “动态参数” 表格下的数据
				}
				this.onlyTableData = res.data
			},


			// 监听添加对话框的关闭事件
			addDialogClosed () {
				this.$refs.addFormRef.resetFields()  // 重置
			},


			// 点击按钮，添加动态参数或者静态属性  categories/:id/attributes
			addParams () {
				// 表单提交的预校验
				this.$refs.addFormRef.validate(async valid => {
					if (!valid) return
					// 发起请求
					const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`,
						{
							attr_name: this.addForm.attr_name,   // 键 是后台提供的传递的名字
							attr_sel: this.activeName
						})
					if (res.meta.status !== 201) {
						return this.$message.error('添加参数失败！')
					}
					this.$message.success('添加参数成功！')
					this.addDialogVisible = false
					this.getParamsData()  // 刷新获取参数的列表
				})
			},


			// 点击按钮，展示修改的对话框
			async showEditDialog (attr_id) {  // attr_id 用来接收 模板中的 scope.row.attr_id
				// 发起 根据 ID 查询参数 的请求  categories/:id/attributes/:attrId
				// (把 表格 中的数据 根据 id 查询出来，绑定到 单击按钮弹出的 对话框 中)
				const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`,
					{ params: { attr_sel: this.activeName } })
				if (res.meta.status !== 200) {
					return this.$message.error('获取查询参数失败！')
				}
				// 请求成功
				this.editForm = res.data  // 将查询到的信息保存到 修改的表单数据对象 中
				this.editDialogVisible = true // 显示编辑对话框
			},


			// 点击按钮，修改参数信息  categories/:id/attributes/:attrId
			editParams () {
				this.$refs.editFormRef.validate(async valid => {
					if (!valid) return
					const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, { attr_name: this.editForm.attr_name, attr_sel: this.activeName })
					if (res.meta.status !== 200) {
						return this.$message.error('修改参数失败！')
					}
					this.$message.success('修改参数成功！')
					this.getParamsData() // 刷新参数的列表数据
					this.editDialogVisible = false  // 隐藏对话框
				})
			},


			// 根据id删除对应的参数项
			async removeParams (attr_id) {
				// 弹框提示
				const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).catch(err => err)
				// 点“确定”， confirm
				// 点“取消”， cancel
				// console.log(confirmResult);
				if (confirmResult !== 'confirm') {
					return this.$message.info('已取消删除！')
				}
				// 调接口 进行 删除的业务逻辑  categories/:id/attributes/:attrid
				const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
				if (res.meta.status !== 200) {
					return this.$message.error('删除参数失败！')
				}
				this.$message.success('删除参数成功！')
				this.getParamsData()  // 更新参数列表
			},


			// 监听修改对话框的关闭事件  重置修改的表单
			editDialogClosed () {
				this.$refs.editFormRef.resetFields()
			},


			// 文本框失去焦点，或按下 Enter 都会触发
			async handleInputConfirm (row) {
				// 去除字符串两端的空格，如果长度为0，说明输入不合法是空的，需要重置内容为空
				if (row.inputValue.trim().length === 0) {
					row.inputValue = ''
					row.inputVisible = false // 隐藏文本框，切换到按钮
					return
				}
				// console.log(row);
				// 如果没有return，则证明输入的内容，需要做后续处理
				// (1) 将输入到文本框的消息显示在页面
				row.attr_vals.push(row.inputValue.trim())  // 新文本保存到数组
				row.inputValue = ''  // 重置
				row.inputVisible = false  // 隐藏文本框显示为按钮
				// (2)调用 saveAttrVals() 发起请求，保存这次操作
				this.saveAttrVals(row)

				// console.log('ok');
			},


			// 将对 attr_vals 的操作，保存到数据库
			async saveAttrVals (row) {
				// (2) 需要发起请求，保存这次操作  categories/:id/attributes/:attrId
				const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
					attr_name: row.attr_name,
					attr_sel: row.attr_sel,
					attr_vals: row.attr_vals.join(' ')  // row.attr_vals 是数组，传到后台的数据是字符串，用join转为字符串
				})
				if (res.meta.status !== 200) {
					return this.$message.error('修改参数项失败！')
				}
				this.$message.success('修改参数项成功！')
			},


			// 点击按钮，展示文本输入框
			showInput (row) {
				row.inputVisible = true
				// 让文本框自动获得焦点
				// $nextTick 方法的作用，就是当页面上元素被重新渲染之后，才会指定回调函数中的代码
				this.$nextTick(_ => {
					this.$refs.saveTagInput.$refs.input.focus();
				});
			},


			// 点击x号，删除对应的参数可选项
			handleClose (i, row) {
				row.attr_vals.splice(i, 1)  // 从 索引为 i 位置，删除1个
				this.saveAttrVals(row) // 发起请求 对 attr_vals 的操作，保存到数据库
			},

		},

		computed: {
			isBtnDisabled () {
				// 选中三级分类，按钮启动；未选中三级分类，按钮禁用。
				// 如果按钮需要被禁用，则返回true，否则返回false
				if (this.selectedCateKeys.length != 3) {
					return true
				}
				return false
			},

			// 处理 获取参数列表数据的 请求路径：categories/:id/attributes 中的动态参数 id
			// 当前选中的三级分类的Id
			cateId () {
				if (this.selectedCateKeys.length === 3) {
					return this.selectedCateKeys[2]
				}
				return null
			},

			// 动态计算标题的文本
			titleText () {
				if (this.activeName === 'many') {
					return '动态参数'
				}
				return '静态属性'
			}
		}
	}
</script>

<style lang="less" scoped>
	.cat_opt {
		margin: 15px 0;
	}

	.el-tag {
		margin: 10px;
	}
	.input-new-tag {
		width: 120px;
	}
</style>