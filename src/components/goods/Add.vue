<template>
	<div>
		<!-- 面包屑导航区域 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>商品管理</el-breadcrumb-item>
			<el-breadcrumb-item>添加商品</el-breadcrumb-item>
		</el-breadcrumb>

		<!-- 卡片视图区域 -->
		<el-card>
			<!-- 消息提示 -->
			<el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
			<!-- 步骤条区域 -->
			<!-- :active 要接收数值类型。定义的 activeIndex 是字符串类型，字符串类型 减 0  可转为 number类型 -->
			<el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
				<el-step title="基本信息"></el-step>
				<el-step title="商品参数"></el-step>
				<el-step title="商品属性"></el-step>
				<el-step title="商品图片"></el-step>
				<el-step title="商品内容"></el-step>
				<el-step title="完成"></el-step>
			</el-steps>

			<!-- 实现步骤条和 tab 栏的数据联动效果：让 tab 栏的 name 值 为 步骤条 设置的 索引 共用 activeIndex -->

			<!-- tab栏区域 -->
			<el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
				<!-- before-leave 切换标签之前的钩子，若返回 false 或者返回 Promise 且被 reject，则阻止切换。 -->
				<el-tabs :tab-position="'left'" v-model="activeIndex" :before-leave="beforeTabLeave" @tab-click="tabClicked">
					<el-tab-pane label="基本信息" name="0">
						<el-form-item label="商品名称" prop="goods_name">
							<el-input v-model="addForm.goods_name"></el-input>
						</el-form-item>
						<el-form-item label="商品价格" prop="goods_price">
							<el-input v-model="addForm.goods_price" type="number"></el-input>
						</el-form-item>
						<el-form-item label="商品重量" prop="goods_weight">
							<el-input v-model="addForm.goods_weight" type="number"></el-input>
						</el-form-item>
						<el-form-item label="商品数量" prop="goods_number">
							<el-input v-model="addForm.goods_number" type="number"></el-input>
						</el-form-item>
						<el-form-item label="商品分类" prop="goods_cat">
							<!-- 商品分类的级联选择器 -->
							<!-- options 指定选项数组（数据源） value / v-model	选中项绑定值 -->
							<el-cascader v-model="addForm.goods_cat" :options="catelist" :props="cateProps" @change="handleChange"></el-cascader>
						</el-form-item>
					</el-tab-pane>
					<el-tab-pane label="商品参数" name="1">
						<!-- 渲染表单的 Item 项 -->
						<el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
							<!-- 复选框组 -->
							<el-checkbox-group v-model="item.attr_vals">
								<el-checkbox :label="cb" v-for="(cb, index) in item.attr_vals" :key="index" border></el-checkbox>
							</el-checkbox-group>
						</el-form-item>
					</el-tab-pane>
					<el-tab-pane label="商品属性" name="2">
						<el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
							<!-- 文本输入框 -->
							<el-input v-model="item.attr_vals"></el-input>
						</el-form-item>
					</el-tab-pane>
					<el-tab-pane label="商品图片" name="3">
						<!-- 上传图片 -->
						<!-- action 表示图片要上传到的后台API地址 -->
						<el-upload :action="uploadURL" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture" :headers="headerObj" :on-success="handleSuccess">
							<el-button size="small" type="primary">点击上传</el-button>
						</el-upload>
					</el-tab-pane>
					<el-tab-pane label="商品内容" name="4">
						<!-- 富文本编辑器 -->
						<!-- 数据双向绑定到 商品的表单数据对象 中 -->
						<quill-editor v-model="addForm.goods_introduce"></quill-editor>
						<!-- 按钮 -->
						<el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
					</el-tab-pane>
				</el-tabs>
			</el-form>

		</el-card>

		<!-- 图片预览 -->
		<el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
			<img :src="previewPath" alt="" class="previewImg">
		</el-dialog>

	</div>
</template>

<script>
	// 导入 深拷贝的包
	import _ from 'lodash'

	export default {
		data () {
			return {
				// active　设置当前激活步骤 的 索引
				activeIndex: '0',   // 定义为 字符串类型
				// 添加商品的表单数据对象
				addForm: {
					goods_name: '',
					goods_price: 0,
					goods_weight: 0,
					goods_number: 0,
					// 商品所属的分类数组
					goods_cat: [],
					// 图片的数组
					pics: [],
					// 商品的详情
					goods_introduce: '',
					// 商品的参数（数组），包含 `动态参数` 和 `静态属性`
					attrs: []
				},
				// 
				// 表单的校验规则
				addFormRules: {
					goods_name: [
						{ required: true, message: '请输入商品名称', trigger: 'blur' },
					],
					goods_price: [
						{ required: true, message: '请输入商品价格', trigger: 'blur' },
					],
					goods_weight: [
						{ required: true, message: '请输入商品重量', trigger: 'blur' },
					],
					goods_number: [
						{ required: true, message: '请输入商品数量', trigger: 'blur' },
					],
					goods_cat: [
						{ required: true, message: '请输入商品分类', trigger: 'blur' },
					],
				},
				// 商品分类列表
				catelist: [],
				// 级联选择器中的配置对象
				cateProps: {
					expandTrigger: 'hover',
					label: 'cat_name',
					value: 'cat_id',
					children: 'children'
				},
				// 动态参数列表数据
				manyTableData: [],
				// 静态属性列表数据
				onlyTableData: [],
				// 上传图片的URL地址
				uploadURL: ' http://127.0.0.1:8888/api/private/v1/upload',
				// 图片上传组件的headers请求头对象
				headerObj: {
					Authorization: window.sessionStorage.getItem('token')
				},
				// 预览图片路径
				previewPath: '',
				// visible属性，它接收Boolean，当为true时显示 Dialog。
				previewVisible: false
			}
		},


		created () {
			// 获取商品分类数据
			this.getCateList();

		},

		methods: {
			// 获取所有商品分类数据
			async getCateList () {
				const { data: res } = await this.$http.get('categories')
				if (res.meta.status != 200) {
					return res.$message.error('获取商品分类数据失败！')
				}
				this.catelist = res.data;
				console.log(this.catelist);
			},
			// 级联选择器选中项变化，会触发这个函数
			handleChange () {
				console.log(this.addForm.goods_cat);
				// 控制级联选择器的选中范围（要求选中的只能是三级分类）
				if (this.addForm.goods_cat.length != 3) {
					this.addForm.goods_cat = [] // 清空
				}
			},
			// 阻止页签的切换
			beforeTabLeave (activeName, oldActiveName) {
				// console.log('即将离开的标签页名字是：' + oldActiveName);
				// console.log('即将进入的标签页名字是：' + activeName);
				// return false  // 阻止标签页的切换

				//  阻止标签页切换的条件：当前处于第一个面板或商品分类的长度不等3 
				// 商品分类的长度等3,直接跳出判断，会发生切换
				if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
					this.$message.error('请先选择商品分类！')
					return false
				}
			},

			// (1) 获取动态参数列表
			async tabClicked () {
				// console.log(this.activeIndex); 
				// 证明访问的是动态参数面板 (判断 activeIndex 是 1 , 证明点入“商品参数”，发起请求获取动态参数列表数据  categories/:id/attributes)
				// 通过计算属性计算 id(三级商品分类的id)
				if (this.activeIndex === '1') {
					const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
					if (res.meta.status !== 200) {
						return this.$message.error('获取动态参数列表失败！')
					}
					console.log(res.data);
					// 遍历 将每一项的 attr_vals 转换为 数组， checkbox-group元素能把多个 checkbox 管理为一组，只需要在 Group 中使用v-model绑定Array类型的变量即可
					res.data.forEach(item => {
						item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
					})
					this.manyTableData = res.data
				} else if (this.activeIndex === '2') {
					// (2) 获取静态属性列表数据
					const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
					if (res.meta.status !== 200) {
						return this.$message.error('获取静态属性列表失败！')
					}
					console.log(res.data);
					this.onlyTableData = res.data
				}
			},

			// 处理图片预览效果
			handlePreview (file) {
				console.log(file);
				this.previewPath = file.response.data.url
				this.previewVisible = true  // 显示对话框（图片预览的大图）
			},

			// 处理移除图片的操作
			handleRemove (file) {
				console.log(file);
				// 1. 获取将要删除的图片的临时路径
				const filePath = file.response.data.tmp_path
				// 2. 从 pics 数组中，找到这个图片对应的索引值（value数组里的每一项）
				const i = this.addForm.pics.findIndex(value =>
					value.pic === filePath
				)
				// 3.调用数组的 splice 方法，把图片信息对象，从 pics 数组中移除
				this.addForm.pics.splice(i, 1)  // 从索引i开始，删除一项
				console.log(this.addForm);
			},

			// 监听图片上传成功的事件
			handleSuccess (response) {
				console.log(response);
				// 1. 拼接得到一个图片信息对象
				const picInfo = { pic: response.data.tmp_path }
				// 2. 将图片信息对象，push 到 pics数组中
				this.addForm.pics.push(picInfo)
				console.log(this.addForm);
			},

			// 点击“添加商品”按钮  添加商品
			add () {
				// console.log(this.addForm);
				// (1) 实现表单数据的预验证
				this.$refs.addFormRef.validate(async valid => {
					if (!valid) {
						return this.$message.error('请填写必要的表单项！')
					}
					// (2) 执行添加的业务逻辑
					// TODO:(处理请求参数)
					// (2-1) 把 goods_cat 从数组转换为字符串 (goods_cat以为','分割的分类列表)
					// this.addForm.goods_cat = this.addForm.goods_cat.join(',')  // 报错：级联选择器中的goods_cat是需要数组的，但执行添加的业务逻辑发起的请求中的goods_cat 是字符串。
					// (lodash) (将addForm对象 深拷贝) cloneDeep(obj)
					const form = _.cloneDeep(this.addForm)
					form.goods_cat = form.goods_cat.join(',')
					// (2-2) 处理 attrs 数组
					// 商品的参数（数组），包含 `动态参数` 和 `静态属性`
					// (2-2-1) 处理动态参数
					this.manyTableData.forEach(item => {
						const newInfo = {
							attr_id: item.attr_id,
							attr_value: item.attr_vals.join(' ')  // 数组 转 字符串
						}
						this.addForm.attrs.push(newInfo)
					})
					// (2-2-2) 处理静态属性
					this.onlyTableData.forEach(item => {
						const newInfo = {
							attr_id: item.attr_id,
							attr_value: item.attr_vals  // 已经是字符串，不用在 join
						}
						this.addForm.attrs.push(newInfo)
					})
					// 赋值给深拷贝后的 form 对象
					form.attrs = this.addForm.attrs
					console.log(form);

					// TODO:发起请求添加商品   goods
					// 商品的名称，必须是唯一的
					const { data: res } = await this.$http.post('goods', form)
					if (res.meta.status !== 201) {
						return this.$message.error('添加商品失败！')
					}
					this.$message.success('添加商品成功！')
					// 跳转到“商品列表”页面
					this.$router.push('/goods')
				})

			}
		},

		computed: {
			// 获取 三级商品分类的id
			cateId () {
				if (this.addForm.goods_cat.length === 3) {
					return this.addForm.goods_cat[2]
				}
				return null
			}
		},


	}

</script>

<style lang="less" scoped>
	.el-steps {
		margin: 15px 0;
	}
	.el-step__title {
		font-size: 12px;
	}
	.el-checkbox {
		margin: 0 10px 0 0 !important;
	}
	.previewImg {
		width: 100%;
	}
	.btnAdd {
		margin-top: 15px;
	}
</style>