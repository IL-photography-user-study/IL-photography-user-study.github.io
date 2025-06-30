<template>
  <div>
    <!-- Header -->
    <header>
      <h1 class="title">Fotobot: Flow Matching Policies for Autonomous Portrait Photography Robot</h1>
      <h2 class="subtitle">Anonymous Questionnaire for Aesthetic Assessment</h2>
    </header>

    <!-- Description -->
    <div class="description">
      <p><strong>Objective:</strong></p>
      <p>To evaluate the quality of photographic works from multiple dimensions.</p>
      <p><strong>Questionnaire:</strong></p>
      <ol>
        <li>How well is the image composited? (comply with rules of thirds, balancing elements, or symmetry)</li>
        <li>How well is the main subject emphasized in the image?</li>
        <li>How well does the image highlight the relation between the character and the background?</li>
        <li>How well does the image have the sense of telling stories?</li>
      </ol>
    </div>

    <!-- Tips栏 -->
    <div class="tips-bar">
      <p><strong>Tips:</strong> Click images to enlarge. Drag numbers to rank each group under every question.</p>
    </div>

    <!-- 六组，每行两组，共三行 -->
    <div v-for="row in 3" :key="'row-' + row">
      <a-row :gutter="16" class="group-wrapper">
        <a-col :span="12" v-for="col in 2" :key="'group-' + ((row - 1) * 2 + col)">
          <template v-if="(row - 1) * 2 + col <= 6">
            <div class="group-title">Group {{ (currentGroup - 1) * 6 + (row - 1) * 2 + col }}</div>
            <a-row :gutter="8">
              <a-col :span="12" v-for="i in 2" :key="i">
                <div class="image-container" @click="openPreview((row - 1) * 2 + col, i - 1)">
                  <img :src="getImagePath(groupImages((row - 1) * 2 + col)[i - 1])" class="grid-img" />
                  <div class="img-label">{{ i }}</div>
                </div>
              </a-col>
            </a-row>
            <a-row :gutter="8">
              <a-col :span="12" v-for="i in [3, 4]" :key="i">
                <div class="image-container" @click="openPreview((row - 1) * 2 + col, i - 1)">
                  <img :src="getImagePath(groupImages((row - 1) * 2 + col)[i - 1])" class="grid-img" />
                  <div class="img-label">{{ i }}</div>
                </div>
              </a-col>
            </a-row>

            <!-- 排序 -->
            <div
              class="ranking-section"
              v-for="(list, qIndex) in groupRankings[(row - 1) * 2 + col - 1]"
              :key="'ranking-' + ((row - 1) * 2 + col) + '-' + qIndex"
            >
              <div class="ranking-bar">
                <span class="ranking-title">Q{{ qIndex + 1 }}</span>
                <span class="ranking-label">Best</span>
                <draggable
                  v-model="groupRankings[(row - 1) * 2 + col - 1][qIndex]"
                  :options="{ animation: 200 }"
                  class="drag-list"
                  tag="div"
                >
                  <div
                    v-for="num in groupRankings[(row - 1) * 2 + col - 1][qIndex]"
                    :key="num"
                    class="drag-number"
                  >
                    {{ (num % 4 === 0 ? 4 : num % 4) }}
                  </div>
                </draggable>
                <span class="ranking-label">Worst</span>
              </div>
            </div>
          </template>
        </a-col>
      </a-row>
    </div>

    <!-- 分页 -->
    <div style="text-align: center; margin-top: 24px">
      <a-pagination
        :current="currentGroup"
        :page-size="1"
        :total="Math.ceil(totalImages / 24)"
        @change="handleGroupChange"
        simple
      />
    </div>

    <!-- 图片放大预览 -->
    <a-modal
      :visible="previewVisible"
      :footer="null"
      :width="800"
      centered
      @cancel="previewVisible = false"
    >
      <a-carousel ref="carousel" :dots="false" arrows :initial-slide="currentIndex" @afterChange="updateCurrentIndex">
        <div v-for="(img, idx) in previewGroupImages" :key="img">
          <img :src="getImagePath(img)" class="carousel-image" />
          <div class="preview-index">{{ idx + 1 }}</div>
        </div>
      </a-carousel>

      <div class="thumbnail-bar">
        <div
          v-for="(img, idx) in previewGroupImages"
          :key="'thumb-' + img"
          class="thumbnail"
          :class="{ active: idx === currentIndex }"
          @click="goToSlide(idx)"
        >
          <img :src="getImagePath(img)" />
        </div>
      </div>
    </a-modal>

    <!-- submit -->
    <div style="text-align: center; margin-top: 24px;">
      <a-button v-if="currentGroup === Math.ceil(totalImages / 24)" type="primary" :loading="isSubmitting" :disabled="isSubmitting" @click="submitForm">submit</a-button>
    </div>
  </div>
</template>


<script>
import draggable from "vuedraggable";

export default {
  components: { draggable },
  data() {
    return {
      currentGroup: 1,
      totalImages: 384,
      previewVisible: false,
      currentIndex: 0,
      previewGroupImages: [],
      isSubmitting: false,
      groupRankings: []
    };
  },
  computed: {
    currentGroupImages() {
      const base = (this.currentGroup - 1) * 8;
      return Array.from({ length: 8 }, (_, i) => base + i + 1);
    },
    
  },
  methods: {
    getImagePath(n) {
      return require(`@/assets/photo/${n}.jpg`);
    },
    groupImages(groupIdx) {
      const base = (this.currentGroup - 1) * 24 + (groupIdx - 1) * 4;//*8
      return Array.from({ length: 4 }, (_, i) => base + i + 1);
    },
    openPreview(groupIdx, index) {
      this.previewGroupImages = this.groupImages(groupIdx);
      this.currentIndex = index;
      this.previewVisible = true;
      this.$nextTick(() => this.$refs.carousel.goTo(index));
    },
    goToSlide(index) {
      this.currentIndex = index;
      this.$refs.carousel.goTo(index);
    },
    updateCurrentIndex(index) {
      this.currentIndex = index;
    },
    handleGroupChange(p) {
      this.currentGroup = p;
      this.initRankings();
    },
    initRankings() {
      const base = (this.currentGroup - 1) * 24;//*8
      // this.groupRankings = [0, 1].map(i =>
      //   Array(4).fill(0).map(() => [base + i * 4 + 1, base + i * 4 + 2, base + i * 4 + 3, base + i * 4 + 4])
      // );
      this.groupRankings = Array.from({ length: 6 }, (_, i) =>
        Array(4).fill(0).map(() => [base + i * 4 + 1, base + i * 4 + 2, base + i * 4 + 3, base + i * 4 + 4])
      );
    },
    submitForm() {
      this.isSubmitting = true;
      fetch("https://zhilan-leo-il-photography-backward.hf.space/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group: this.currentGroup,
          groupRankings: this.groupRankings
        })
      })
        .then(response => {
          if (!response.ok) throw new Error("Network response was not ok");
          return response.json();
        })
        .then(data => {
          console.log("submit:", data);
          this.$router.push("/thanks");
        })
        .catch(err => {
          console.error("submit error:", err);
          this.$message.error("Failed");
        })
        .finally(() => (this.isSubmitting = false));
    }
  },
  mounted() {
    this.initRankings();
  }
};
</script>

<style scoped>
.title {
  text-align: center;
  font-size: 26px;
  margin: 20px 0 10px;
}
.subtitle {
  text-align: center;
  font-size: 16px;
  color: #555;
  margin-bottom: 20px;
}
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
.tips-bar {
  text-align: center;
  margin-bottom: 10px; 
  background: #e6f7ff;
  padding: 5px;
  border: 1px solid #91d5ff;
}
.tips-bar p {
  margin: 0;
}
/* .group-title {
  font-weight: bold;
  margin: 12px 0 8px;
} */
 /* 每行（两组）的外层行距 */
.group-wrapper {
  margin-bottom: 32px;
}

/* 每个组的卡片风格 */
.group-card {
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin: 12px 0;
}

/* 组内标题加大间距 */
.group-title {
  font-weight: bold;
  margin: 12px 0 12px;
  font-size: 16px;
}


.image-container {
  position: relative;
  cursor: pointer;
  margin-bottom: 8px;
}
.grid-img {
  width: 100%;
  object-fit: contain;
  aspect-ratio: 16/9;
}
.img-label {
  position: absolute;
  top: 4px;
  left: 6px;
  background: #1890ff;
  color: white;
  font-weight: bold;
  font-size: 14px;
  padding: 2px 6px;
  border-radius: 4px;
}
.ranking-section {
  /* margin: 12px auto;
  max-width: 480px; */
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px dashed #d0d0d0;
}
.ranking-title {
  font-weight: bold;
  margin-right: 8px;
}
.ranking-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: flex-start;
  flex-wrap: wrap;
}
.ranking-label {
  font-size: 14px;
  color: #999;
  min-width: 40px;
  text-align: center;
}
.drag-list {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}
.drag-number {
  width: 40px;
  height: 40px;
  background: #f0f0f0;
  border: 2px solid #1890ff;
  border-radius: 4px;
  text-align: center;
  line-height: 36px;
  font-weight: bold;
  font-size: 18px;
  cursor: grab;
  user-select: none;
}
.carousel-image {
  width: 100%;
  object-fit: contain;
  position: relative;
}
.preview-index {
  position: absolute;
  top: 12px;
  left: 20px;
  background: rgba(0,0,0,0.6);
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: bold;
}
.thumbnail-bar {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 10px 0;
  justify-content: center;
}
.thumbnail {
  width: 80px;
  height: 45px;
  border: 2px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s;
}
.thumbnail.active {
  border-color: #1890ff;
}
.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
