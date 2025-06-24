<template>
  <div>
    <div class="description">
      <p><strong>Objective：</strong></p>
      <p>To evaluate the quality of photographic works from multiple dimensions.</p>

      <p><strong>Questionnaire:</strong></p>
      <ol>
        <li>How well is the image composited? (comply with rules of thirds, balancing elements, or symmetry)</li>
        <li>How well is the main subject emphasized in the image?</li>
        <li>How well does the image highlight the relation between the character and the background?</li>
        <li>How well does the image have the sense of telling stories?</li>
      </ol>
    </div>

    <div class="image-grid">
      <a-row :gutter="16">
        <a-col
          v-for="img in currentPageImages"
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

      <!-- 分页组件 -->
      <div style="text-align: center; margin-top: 24px;">
        <a-pagination
          :current="currentPage"
          :page-size="pageSize"
          :total="totalImages"
          @change="handlePageChange"
          simple
        />
      </div>

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
          <div v-for="img in totalImageNumbers" :key="img">
            <img :src="getImagePath(img)" class="carousel-image" />
          </div>
        </a-carousel>
      </a-modal>

      <!-- 提交按钮 -->
      <div style="text-align: center; margin-top: 24px;">
        <a-button v-if="currentPage === totalPages" type="primary" @click="submitForm">submit</a-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      previewVisible: false,
      currentIndex: 0,
      totalImages: 8, 
      pageSize: 4,    
      currentPage: 1,
      ratings: Array.from({ length: 12 }, () => Array(4).fill(3)),
      marks: {
        1: '1',
        2: '2',
        3: '3',
        4: '4',
        5: '5',
      },
    };
  },
  computed: {
    totalImageNumbers() {
      return Array.from({ length: this.totalImages }, (_, i) => i + 1);
    },
    currentPageImages() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.totalImageNumbers.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.totalImages / this.pageSize);
    },
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
    handlePageChange(page) {
      this.currentPage = page;
    },
    
    submitForm() {
      fetch("https://zhilan-leo-photo-survey-api.hf.space/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ratings: this.ratings })
      })
        .then(response => response.json())
        .then(data => {
          console.log("submit:", data);
          this.$message.success("submit successful");
        })
        .catch((err) => {
          console.error(err);
          this.$message.error("submit fail");
        });
    }

  },
};
</script>

<style scoped>
.description {
  padding: 16px 24px;
  margin-bottom: 16px;
  background-color: #fafafa;
  border-left: 4px solid #1890ff;
  font-size: 14px;
  line-height: 1.6;
}
.description p {
  margin: 4px 0;
}
.description ol {
  padding-left: 20px;
}

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
  gap: 5px;
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
