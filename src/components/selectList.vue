<template>
  <div class="select-wrap">
    <div class="main">
      <div class="label">{{label}}</div>
      <div class="list">
        <div class="select-item" v-for="(item, index) in data" :key="index" @click="confirm(item)">{{item.key}}</div>
      </div>
      <div class="cancel-btn" @click="cancel">取消</div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    label: {
      type: String
    },
    data: {
      type: Array
    }
  },
  methods: {
    confirm(data) {

    },
    cancel() {
      this.$emit('cancel')
    }
  }
}
</script>

<style lang="scss" scoped>
.select-wrap {
  z-index: 999;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba($color: #000000, $alpha: 0.3);
  .main {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #fff;
  }
}
</style>