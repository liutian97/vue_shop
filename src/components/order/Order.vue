<template>
	<div>
		<!-- 面包屑导航区域 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>订单管理</el-breadcrumb-item>
			<el-breadcrumb-item>订单列表</el-breadcrumb-item>
		</el-breadcrumb>

		<!-- 卡片视图区域 -->
		<el-card>
			<el-row>
				<el-col :span="8">
					<!-- 搜索文本框 -->
					<el-input placeholder="请输入内容">
						<el-button slot="append" icon="el-icon-search"></el-button>
					</el-input>
				</el-col>
			</el-row>

			<!-- 订单列表数据 -->
			<!-- table表格区域 -->
			<el-table :data="orderlist" border stripe>
				<!-- 索引列 -->
				<el-table-column type="index" label="#"></el-table-column>
				<el-table-column prop="order_number" label="订单编号"></el-table-column>
				<el-table-column prop="order_price" label="订单价格"></el-table-column>
				<el-table-column prop="pay_status" label="是否付款">
					<!-- 作用域插槽  -->
					<template slot-scope="scope">
						<el-tag type="success" v-if="scope.row.pay_status === '1' ">已付款</el-tag>
						<el-tag type="danger" v-else>未付款</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="is_send" label="是否发货"></el-table-column>
				<el-table-column prop="create_time" label="下单时间">
					<!-- 作用域插槽  -->
					<!-- 时间格式化过滤器 -->
					<template slot-scope="scope">
						{{scope.row.create_time | dateFormat}}
					</template>
				</el-table-column>
				<el-table-column prop="order_number" label="操作">
					<!-- 作用域插槽 -->
					<template slot-scope="scope">
						<el-button type="primary" icon="el-icon-edit" size="mini" @click="showBox"></el-button>
						<el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox"></el-button>
					</template>
				</el-table-column>

			</el-table>

			<!-- 分页区域 -->
			<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15, 20]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total" background></el-pagination>

			<!-- 修改地址的对话框 -->
			<el-dialog title="修改地址" :visible.sync="addressVisible" width="50%" @close="addressDialogClosed">
				<el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
					<el-form-item label="省市区/县" prop="address1">
						<!-- 级联选择器 -->
						<el-cascader v-model="addressForm.address1" :options="cityData" :props="{ expandTrigger: 'hover' }"></el-cascader>
					</el-form-item>
					<el-form-item label="详细地址" prop="address2">
						<el-input v-model="addressForm.address2"></el-input>
					</el-form-item>
				</el-form>
				<span slot="footer" class="dialog-footer">
					<el-button @click="dialogVisible = false">取 消</el-button>
					<el-button type="primary" @click="dialogVisible = false">确 定</el-button>
				</span>
			</el-dialog>

			<!-- 展示物流进度的对话框 -->
			<el-dialog title="物流进度" :visible.sync="progressVisible" width="50%">
				<!-- 物流进度的时间线 -->
				<el-timeline>
					<el-timeline-item v-for="(activity, index) in progressInfo" :key="index" :timestamp="activity.time">
						{{activity.context}}
					</el-timeline-item>
				</el-timeline>

			</el-dialog>

		</el-card>
	</div>

</template>

<script>
	// 导入 citydata.js （级联选择器中需使用的 省市区县）
	import cityData from './citydata.js'
	// 导入 db.js  （原有的API接口存在问题，所以将数据放在本地，导入数据，保存文件db.js）
	import db from './db.js'


	export default {
		data () {
			return {
				// 查询参数
				queryInfo: {
					query: '', // 查询参数
					pagenum: 1,  // 当前页码
					pagesize: 10 // 每页显示的数据
				},
				// 订单列表
				orderlist: [],
				// 总数据条数
				total: 0,

				// 是否展示修改地址的对话框
				addressVisible: false,
				// 修改地址的对话框绑定的表单数据
				addressForm: {
					address1: [], // 绑定的数据是级联选择器，定义为数组
					address2: ''  // 定义为字符串
				},
				// 添加表单的验证规则对象
				addressFormRules: {
					address1: [
						{ required: true, message: '请选择省市区/县', trigger: 'blur' },
					],
					address2: [
						{ required: true, message: '请填写详细地址', trigger: 'blur' },
					],
				},
				// 将导入的 cityData 定义给对象
				// cityData: cityData  属性名和属性值同名可以简写
				cityData,

				// 是否显示物流进度的对话框
				progressVisible: false,

				// 物流数据放在本地（原有的API接口存在问题）
				db: db,

				// 物流信息
				progressInfo: []


			}
		},

		created () {
			// 获取订单列表数据
			this.getOrderList()
		},

		methods: {
			// 获取订单列表数据  orders
			async getOrderList () {
				const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
				if (res.meta.status !== 200) {
					return this.$message.error('获取订单列表数据失败！')
				}

				console.log(res);
				// 把后台响应的数据传到定义的 data 中
				this.total = res.data.total
				this.orderlist = res.data.goods
			},

			// 每页显示条数 pageSize 改变时触发
			handleSizeChange (newSize) {
				this.queryInfo.pagesize = newSize
				this.getOrderList()
			},

			// 当前 pagenum 改变时触发
			handleCurrentChange (newPage) {
				this.queryInfo.pagenum = newPage
				this.getOrderList()
			},

			// 展示修改地址的对话框
			showBox () {
				this.addressVisible = true
			},

			// 点击“取消”对话框关闭后清空表单
			addressDialogClosed () {
				this.$refs.addressFormRef.resetFields()
			},

			// 展示物流进度的对话框
			// (注意！) 原有的API接口存在问题，故不在请求接口进行后台数据的返回，直接使用模拟的数据进行测试。

			// async showProgressBox () {
			// 	// 发起查看物流信息的请求  '/kuaidi/:id'
			// 	const { data: res } = await this.$http.get('/kuaidi/1106975712662')
			// 	if (res.meta.status !== 200) {
			// 		return this.$message.error('获取物流进度失败！')
			// 	}
			// 	this.progressInfo = res.data

			// 	this.progressVisible = true
			// 	console.log(this.progressInfo)
			// }

			showProgressBox () {
				this.progressInfo = this.db
				this.progressVisible = true
				console.log(this.progressInfo)
			}

		}
	}
</script>

<style lang="less" scoped>
	.el-cascader {
		width: 100%;
	}
</style>