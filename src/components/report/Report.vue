<template>
	<div>
		<!-- 面包屑导航区域 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>数据统计</el-breadcrumb-item>
			<el-breadcrumb-item>数据报表</el-breadcrumb-item>
		</el-breadcrumb>

		<!-- 卡片视图区域 -->
		<el-card>
			<!-- (2) 为 ECharts 准备一个定义了宽高的 DOM  -->
			<div id="main" style="width: 750px;height:400px;"></div>
		</el-card>
	</div>

</template>

<script>
	// (1) 导入 ECharts 依赖 （查看 Apache ECharts 官方文档进行导入）
	import * as echarts from 'echarts';
	// 导入 lodash
	import _ from 'lodash'



	export default {
		data () {
			return {
				// (注意：) 只请求接口，使用服务器返回的数据不完整，没有鼠标跟随效果。
				// TODO: 需要使用 lodash 依赖 将 服务器返回的数据 和 options 进行数据合并
				// 需要合并的选项
				options: {
					title: {
						text: '用户来源'
					},
					tooltip: {
						trigger: 'axis',
						axisPointer: {
							type: 'cross',
							label: {
								backgroundColor: '#E9EEF3'
							}
						}
					},
					grid: {
						left: '3%',
						right: '4%',
						bottom: '3%',
						containLabel: true
					},
					xAxis: [
						{
							boundaryGap: false
						}
					],
					yAxis: [
						{
							type: 'value'
						}
					]
				}
			}
		},

		created () {

		},

		// 此时，页面上的元素，已经被渲染完毕
		// TODO:显示 Demo 图表
		async mounted () {
			// (3) 基于准备好的dom，初始化echarts实例
			var myChart = echarts.init(document.getElementById('main'));
			// 发起 基于时间统计的折线图 的请求      请求路径：reports/type/1
			const { data: res } = await this.$http.get('reports/type/1')
			if (res.meta.status !== 200) {
				return this.$message.error('获取折现图数据失败！')
			}
			// (4) 指定图表的配置项和数据
			// 使用 lodash 将两个对象进行合并
			const result = _.merge(res.data, this.options)

			// (5) 使用刚指定的配置项和数据显示图表。
			// myChart.setOption(res.data);   // 只请求接口，使用服务器返回的数据不完整
			myChart.setOption(result);
		},

		methods: {

		}
	}
</script>

<style lang="less" scoped>
</style>