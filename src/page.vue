<!--
 * @Author: liaozhilan lzl16975772022@163.com
 * @Date: 2025-06-24 10:12:55
 * @LastEditors: liaozhilan lzl16975772022@163.com
 * @LastEditTime: 2025-06-27 15:18:03
 * @FilePath: \IL-photography\src\page.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
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
            class= "carousel-image" 
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
        <!--main-->
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
        
        <!-- slides -->
        <div class="thumbnail-bar">
          <div
            v-for="img in currentPageImages"
            :key="'thumb-' + img"
            class="thumbnail"
            :class="{ active: img - 1 === currentIndex }"
            @click="goToSlide(img - 1)"
          >
            <img :src="getImagePath(img)" />
          </div>
        </div>
      </a-modal>
      

      <!-- submit -->
      <div style="text-align: center; margin-top: 24px;">
        <a-button v-if="currentPage === totalPages" type="primary" :loading="isSubmitting" :disabled="isSubmitting" @click="submitForm">submit</a-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    const total = 24;
    return {
      previewVisible: false,
      currentIndex: 0,
      totalImages: total, 
      pageSize: 4,    
      currentPage: 1,
      isSubmitting: false,
      ratings: Array.from({ length: total }, () => Array(4).fill(1)),
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
    goToSlide(index) {
      this.currentIndex = index;
      this.$refs.carousel.goTo(index, false);
    },
    updateCurrentIndex(index) {
      this.currentIndex = index;
    },
    handlePageChange(page) {
      this.currentPage = page;
    },
    
  
    submitForm() {
      if (this.isSubmitting) return;

      this.isSubmitting = true;
      const trimmedRatings = this.ratings.slice(0, this.totalImages);

      fetch("https://zhilan-leo-il-photography-backward.hf.space/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ratings: trimmedRatings})//this.ratings 
      })
        .then(response => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then(data => {
          console.log("submit:", data);
          this.$router.push("/thanks");
          //this.$message.success("submit success");
        })
        .catch((err) => {
          console.error("submit error:", err);
          this.$message.error("submit fail");
        })
        .finally(() => {
          this.isSubmitting = false; // 不管成功失败都重置状态
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

.carousel-image {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: contain;
  display: block;
  margin: auto;
}
.thumbnail-bar {
  display: flex;           /* 横排排列 */
  flex-wrap: nowrap;       /* 不换行 */
  overflow-x: auto;        /* 超出横向滚动 */
  gap: 8px;                /* 缩略图间距 */
  padding: 4px 0;          /* 上下间距 */
  margin-top: 16px;        /* 与主图间距 */
}

.thumbnail {
  flex: 0 0 auto;
  width: 120px;
  height: 67.5px; /* 16:9 = 120 * 9 / 16 */
  border: 2px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;
}
.thumbnail:hover {
  transform: scale(1.1);
}
.thumbnail.active {
  border-color: #1890ff;
}
.thumbnail img {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
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
