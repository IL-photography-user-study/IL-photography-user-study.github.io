<!--
 * @Author: liaozhilan lzl16975772022@163.com
 * @Date: 2025-06-24 09:28:37
 * @LastEditors: liaozhilan lzl16975772022@163.com
 * @LastEditTime: 2025-06-24 11:07:45
 * @FilePath: \IL-photography\page.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div id="components-grid-demo-rating">
    <a-row :gutter="16">
      <a-col
        v-for="(item, imgIndex) in 4"
        :key="imgIndex"
        :span="6"
        style="text-align: center"
      >
        <!-- 图片 -->
        <img
          :src="require(`@/assets/photo/${imgIndex}.jpg`)"
          :alt="'Image ' + imgIndex"
          class="zoom-image"
        />
        <!-- style="width: 100%; margin-bottom: 12px"  -->
        <!-- 每张图片对应 4 个评分 -->
        <div v-for="(question, qIndex) in 4" :key="qIndex" style="margin-bottom: 16px;">
          <span class="question-label">Q{{ qIndex + 1 }}</span>
          <a-slider
            v-model="ratings[imgIndex][qIndex]"
            :min="1"
            :max="5"
            :marks="marks"
            :step="1"
          />
        </div>
      </a-col>
    </a-row>

    <!-- 提交按钮 -->
    <div style="text-align: center; margin-top: 24px;">
      <a-button type="primary" @click="submitForm">提交评分</a-button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // ratings[图片index][问题index]
      ratings: Array.from({ length: 4 }, () => Array(4).fill(3)),
      marks: {
        1: '1',
        2: '2',
        3: '3',
        4: '4',
        5: '5',
      },
    };
  },
  methods: {
    submitForm() {
      console.log('提交的评分:', this.ratings);
      // 你可以在这里发给后端或进行进一步处理
      // 示例：this.$axios.post('/api/submit', this.ratings)
    },
  },
};
</script>

<style scoped>
#components-grid-demo-rating {
  padding: 24px;
}
.zoom-image {
  width: 100%;
  margin-bottom: 12px;
  transition: transform 0.3s ease;
}
.zoom-image:hover {
  transform: scale(1.1);
}
</style>
