<template>
  <div class="image-grid">
    <a-row :gutter="16">
      <a-col
        v-for="img in [1, 2, 3, 4]"
        :key="img"
        :span="6"
        style="text-align: center"
      >
        <img
          :src="getImagePath(img)"
          class="thumbnail"
          @click="openPreview(img)"
        />

        <div class="slider-column">
          <div
            v-for="qIndex in 4"
            :key="qIndex"
            class="slider-item"
          >
            <span class="question-label">Q{{ qIndex }}</span>
            <a-slider
              v-model="ratings[img - 1][qIndex - 1]"
              :min="1"
              :max="5"
              :marks="marks"
              :step="1"
              style="flex: 1"
            />
          </div>
        </div>
      </a-col>
    </a-row>

    <!-- 走马灯弹窗 -->
    <a-modal
      :visible="previewVisible"
      :footer="null"
      :width="800"
      centered
      @cancel="previewVisible = false"
    >
      <a-carousel
        ref="carousel"
        :dots="false"
        arrows
        :initial-slide="currentIndex"
        @afterChange="updateCurrentIndex"
      >
        <div v-for="img in [1, 2, 3, 4]" :key="img">
          <img :src="getImagePath(img)" class="carousel-image" />
        </div>
      </a-carousel>
    </a-modal>

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
      previewVisible: false,
      currentIndex: 0,
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
    getImagePath(imgNumber) {
      return require(`@/assets/photo/${imgNumber}.jpg`);
    },
    openPreview(imgNumber) {
      this.currentIndex = imgNumber - 1;
      this.previewVisible = true;
      this.$nextTick(() => {
        this.$refs.carousel.goTo(this.currentIndex, false);
      });
    },
    updateCurrentIndex(index) {
      this.currentIndex = index;
    },
    submitForm() {
      console.log("提交的评分:", this.ratings);
      // 示例：this.$axios.post('/api/submit', this.ratings)
    },
  },
};
</script>

<style scoped>
.thumbnail {
  width: 100%;
  height: 150px;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.3s ease;
}
.thumbnail:hover {
  transform: scale(1.05);
}
.carousel-image {
  width: 100%;
  height: 400px;
  object-fit: contain;
  display: block;
  margin: auto;
}
.slider-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.slider-item {
  display: flex;
  align-items: center;
  width: 100%;
}
.question-label {
  width: 24px;
  font-weight: 600;
  margin-right: 8px;
  text-align: left;
  user-select: none;
}
</style>
