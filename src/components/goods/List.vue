<template>
	<div>
		<!-- 面包屑导航区域 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>商品管理</el-breadcrumb-item>
			<el-breadcrumb-item>商品列表</el-breadcrumb-item>
		</el-breadcrumb>

		<!-- 卡片视图区域 -->
		<el-card>
			<el-row :gutter="20">
				<el-col :span="8">
					<!-- clear	在点击由 clearable 属性生成的清空按钮时触发 -->
					<el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
						<el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
					</el-input>
				</el-col>
				<el-col :span="4">
					<el-button type="primary" @click="goAddpage">添加商品</el-button>
				</el-col>
			</el-row>

			<!-- table表格区域 -->
			<el-table :data="goodslist" border stripe>
				<!-- 索引列 -->
				<el-table-column type="index" label="#"></el-table-column>
				<el-table-column prop="goods_name" label="商品名称"></el-table-column>
				<el-table-column prop="goods_price" label="商品价格(元)" width="95"></el-table-column>
				<el-table-column prop="goods_weight" label="商品重量" width="70"></el-table-column>
				<el-table-column prop="add_time" label="创建时间" width="140px">
					<template slot-scope="scope">
						{{scope.row.add_time | dateFormat}}
					</template>
				</el-table-column>
				<el-table-column label="操作" width="130px">
					<!-- 作用域插槽 -->
					<template slot-scope="scope">
						<el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
						<el-button type="danger" icon="el-icon-delete" size="mini" @click="removeById(scope.row.goods_id)"></el-button>
					</template>
				</el-table-column>
			</el-table>

			<!-- 分页区域 -->
			<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15, 20]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total" background></el-pagination>

		</el-card>
	</div>

</template>

<script>
	export default {
		data () {
			return {
				// 查询参数对象
				queryInfo: {
					query: '',   // 查询参数
					pagenum: 1,  // 当前页码
					pagesize: 10 // 每页显示条数
				},
				// 商品列表
				goodslist: [],
				// 总数据条数
				total: 0,
			}
		},

		created () {
			this.getGoodsList()

		},

		methods: {
			// 获取商品列表数据
			async getGoodsList () {
				const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
				if (res.meta.status !== 200) {
					return this.$message.error('获取商品列表失败！')
				}
				// console.log(res.data);
				this.$message.success('获取商品列表成功！')
				// 把后台响应的数据传到定义的 data 中
				this.goodslist = res.data.goods  // 数组
				this.total = res.data.total
			},


			// 每页显示条数 pageSize 改变时触发
			handleSizeChange (newSize) {
				this.queryInfo.pagesize = newSize
				this.getGoodsList()
			},


			// 当前 pagenum 改变时触发
			handleCurrentChange (newPage) {
				this.queryInfo.pagenum = newPage
				this.getGoodsList()
			},


			// 根据 Id 删除商品数据
			async removeById (id) {
				const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).catch(err => err)
				if (confirmResult !== 'confirm') {
					return this.$message.info('已取消删除！')
				}
				//  发起删除商品的请求    goods /: id
				const { data: res } = await this.$http.delete(`goods/${id}`)
				if (res.meta.status !== 200) {
					return this.$message.error('删除商品失败！')
				}
				this.$message.success('删除商品成功！')
				this.getGoodsList()
			},


			// 通过编程式导航跳转到商品添加页面
			goAddpage () {
				// 路由编程式导航  this.$router.push('hash地址')
				this.$router.push('/goods/add')
			}

		}
	}
</script>

<style lang="less" scoped>
</style>