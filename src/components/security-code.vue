<template>
  <div class="security-input-box">
    <label for="code">
      <ul class="security-code-container">
        <li
          class="field-wrap"
          :class="{'selected': value[index]}"
          v-for="(item, index) in maxlen"
          :key="index"
        >{{value[index]}}</li>
      </ul>
    </label>
    <input
      id="code"
      class="input-code"
      type="number"
      @input="handleInput($event)"
      :maxlength="maxlen"
      :selection-start="-1"
      :selection-end="-1"
    />
  </div>
</template>

<script>
export default {
  props: {
    value: [String, Number],
    maxlen: {
      type: Number,
      default: 4
    }
  },
  methods: {
    handleInput(event) {
      this.$emit('input', event.target.value)
    }
  }
}
</script>

<style lang="scss" scoped>
.security-input-box {
  position: relative;
  .security-code-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    .field-wrap {
      width: 100rpx;
      height: 100rpx;
      border-radius: 10rpx;
      border: 1rpx solid #e1e1e1;
      line-height: 100rpx;
      text-align: center;
      font-size: 48rpx;
      &.selected {
        border-color: $themeColor;
      }
    }
  }
  .input-code {
    position: absolute;
    top: 0;
    margin-left: -100%;
    width: 300%;
    height: 102rpx;
    outline: none;
    color: transparent;
    text-shadow: 0 0 0 transparent;
  }
}
</style>