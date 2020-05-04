<template>
  <div class="page-wrap">
    <web-view v-if="url" :src="url"></web-view>
  </div>
</template>

<script>
import { envConfig } from '@/env/index'
export default {
data() {
    return {
      type: '',
      url: ''
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
    this.type = options.type
    let title = ''
    if(this.type === 'userProtocol') {
      title = '用户协议'
      this.url = envConfig.USERPROTOCOLURL
    } else if(this.type === 'privacyProtocol') {
      title = '隐私政策'
      this.url = envConfig.PRIVACYPROTOCOLURL
    } else {
      this.url = decodeURIComponent(options.url)
    }
    if(title) {
      wx.setNavigationBarTitle({
        title: title
      })
    }
  }
}
</script>

<style>

</style>