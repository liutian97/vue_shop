<template>
	<div>
		<!-- 面包屑导航区域 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>商品管理</el-breadcrumb-item>
			<el-breadcrumb-item>商品分类</el-breadcrumb-item>
		</el-breadcrumb>

		<!-- 卡片视图区域 -->
		<el-card>
			<!-- 添加分类区域 -->
			<el-row>
				<el-col>
					<el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
				</el-col>
			</el-row>

			<!-- 表格 -->
			<!-- 使用全局注册的 vue-table-tree-grid 组件 注册名为 tree-table-->
			<tree-table class="treeTable" :data="catelist" :show-index="true" index-text="#" :columns="columns" :selection-type="false" :expand-type="false" :show-row-hover="false" border>

				<!-- “是否有效” 列 -->
				<!-- 使用作用域插槽 （作用域插槽slot接收定义的使用模板列的模板名称）自定义模板列渲染表格数据   -->
				<!-- slot-scope 接收这一行的数据 -->
				<template slot="isok" slot-scope="scope">
					<i class="el-icon-success" style="color: lightgreen" v-if="scope.row.cat_deleted === false"></i>
					<i class="el-icon-error" style="color: red" v-else></i>
				</template>

				<!-- “排序” 列-->
				<template slot="order" slot-scope="scope">
					<el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
					<el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
					<el-tag type="warning" size="mini" v-else>三级</el-tag>
				</template>

				<!-- “操作” 列 -->
				<template slot="opt" slot-scope="scope">
					<el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
					<el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
				</template>

			</tree-table>

			<!-- 分页区域 -->
			<!-- current-page	当前页数，支持 .sync 修饰符 -->
			<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="querInfo.pagenum" :page-sizes="[3, 5, 10, 15]" :page-size="querInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
			</el-pagination>

			<!-- “添加分类” 的对话框 -->
			<el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
				<!-- 添加分类的表单 -->
				<el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
					<el-form-item label="分类名称" prop="cat_name">
						<el-input v-model="addCateForm.cat_name"></el-input>
					</el-form-item>
					<el-form-item label="父级分类">
						<!-- 级联选择器 -->
						<el-cascader v-model="selectedKeys" :options="parentCateList" :props="cascaderProps" @change="parentCateChanged" clearable change-on-select></el-cascader>
						<!-- v-model 必须绑定数组 -->
						<!-- options属性指定选项数组(数据源) -->
						<!-- props用来指定配置对象 -->
						<!-- clearable	是否支持清空选项 -->
						<!-- disabled  是否禁用 -->
						<!-- (注意：需要在公共样式上设置级联菜单的高度，否则级联菜单的最后一级看不到) -->
					</el-form-item>
				</el-form>

				<span slot="footer" class="dialog-footer">
					<el-button @click="addCateDialogVisible = false">取 消</el-button>
					<el-button type="primary" @click="addCate">确 定</el-button>
				</span>
			</el-dialog>
		</el-card>
	</div>
</template>

<script>
	export default {
		data () {
			return {
				// 获取商品分类数据的查询参数  
				querInfo: {
					type: 3,
					pagenum: 1,  // 当前页码值
					pagesize: 5  // 每页显示多少条数据
				},
				// 商品分类的数据列表，默认为空
				catelist: [],
				// 总数据条数
				total: 0,
				// 为 vue-table-with-tree-grid 组件的是使用 指定列的定义
				columns: [
					{
						label: '分类名称',
						prop: 'cat_name',
					},
					{
						label: '是否有效',
						// 表示当前列定义为模板列
						type: 'template',
						// 表示当前列使用的模板名称
						template: 'isok',
					},
					{
						label: '排序',
						// 表示当前列定义为模板列
						type: 'template',
						// 表示当前列使用的模板名称
						template: 'order',
					},
					{
						label: '操作',
						// 表示当前列定义为模板列
						type: 'template',
						// 表示当前列使用的模板名称
						template: 'opt',
					},
				],

				// 控制添加分类对话框的显示与隐藏
				addCateDialogVisible: false,

				// 添加分类表单的数据对象
				addCateForm: {
					// 将要添加的  分类名称
					cat_name: '',
					// 父级分类的Id
					cat_pid: 0,  // 默认要添加1级分类，则父分类Id应该设置为0
					// 分类的等级   //  默认要添加的是一级分类 0
					cat_level: 0
				},
				// 添加分类表单的验证规则对象
				addCateFormRules: {
					cat_name: [
						{ required: true, message: '请输入分类名称', trigger: 'blur' },
					],
				},

				// 父级分类 列表数据
				parentCateList: [],
				// 指定级联选择器的配置对象 (根据后台响应的数据进行定义)
				cascaderProps: {
					expandTrigger: 'hover', // expandTrigger	次级菜单的展开方式
					value: 'cat_id',  // value	指定选中的值
					label: 'cat_name',  // label  指定级联选择器中看到的值
					children: 'children' // children 指定父子嵌套的值
				},
				// 选中的父级分类的Id数组
				selectedKeys: [],
			}
		},

		created () {
			this.getCateList()
		},

		methods: {
			// 获取商品分类的列表
			async getCateList () {
				const { data: res } = await this.$http.get('categories', { params: this.querInfo })
				if (res.meta.status !== 200) {
					return this.$message.error('获取商品分类失败！')
				}
				console.log(res.data);
				// 把后台响应的数据列表，赋值给 catelist
				this.catelist = res.data.result
				// 为总数据条数赋值
				this.total = res.data.total
			},


			// 监听 pagesize （每页显示多少条数据） 改变
			handleSizeChange (newSize) {
				this.querInfo.pagesize = newSize
				this.getCateList();
			},


			// 监听 pagenum （当前页码值）改变 
			handleCurrentChange (newPage) {
				this.querInfo.pagenum = newPage
				this.getCateList()
			},


			// 点击按钮，显示添加分类的对话框
			showAddCateDialog () {
				// 先获取父级分类的 分类数据列表
				this.getParentCateList()
				// 再展示出对话框
				this.addCateDialogVisible = true
			},


			// 获取父级商品分类 数据列表
			async getParentCateList () {
				// 调接口
				const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
				if (res.meta.status !== 200) {
					return this.$message.error('获取父级商品分类失败！')
				}
				console.log(res.data);
				this.parentCateList = res.data
			},


			// 选择项发生变化触发此函数
			parentCateChanged () {
				console.log(this.selectedKeys);
				// 如果 selectedKeys 数组中的 length 大于0，证明选中的父级分类
				// 反之，就说明没有选中任何父级分类
				if (this.selectedKeys.length > 0) {
					// 父级分类的Id  ( 将 selectedKeys 数组的最后一项作为父级分类的Id)
					this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
					// 为当前分类的等级赋值
					this.addCateForm.cat_level = this.selectedKeys.length
					return
				} else {
					// 父级分类的Id
					this.addCateForm.cat_pid = 0
					// 为当前分类的等级赋值
					this.addCateForm.cat_level = 0
				}
			},


			// 点击按钮，添加新的分类
			addCate () {
				// console.log(this.addCateForm);  // 查看 分类表单的数据对象

				// 发起请求之前表单预校验
				this.$refs.addCateFormRef.validate(async valid => {
					if (!valid) return
					// 调接口
					const { data: res } = await this.$http.post('categories', this.addCateForm)
					if (res.meta.status !== 201) {
						return this.$message.error('添加分类失败！')
					}
					this.$message.success('添加分类成功！')
					this.getCateList()  // 刷新商品分类数据列表
					this.addCateDialogVisible = false  // 隐藏对话框
				})
			},


			// 监听对话框的关闭事件，重置表单数据 
			addCateDialogClosed () {
				this.$refs.addCateFormRef.resetFields()
				this.selectedKeys = []  // 清空级联选择器v-model上绑定的数据electedKeys
				this.addCateForm.cat_level = ''
				this.addCateForm.cat_pid = ''
			}
		}
	}
</script>

<style lang="less" scoped>
	.treeTable {
		margin-top: 15px;
	}
	.el-cascader {
		width: 100%;
	}
</style>