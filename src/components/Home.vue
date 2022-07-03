<template>
	<el-button type="info" @click="logout">退出</el-button>
</template>

<script>
	export default {
		data () {
			return {

			}
		},
		methods: {
			// 退出功能
			logout () {
				// （1）清空token
				window.sessionStorage.clear()
				// （2）跳转到登录页
				this.$router.push('/login')
			}
		}
	}
</script>

<style lang="less" scoped>
</style>