<template>
  <div>
    <header>
      <h1 class="title">Fotobot: Flow Matching Policies for Autonomous Portrait Photography Robot</h1>
      <h2 class="subtitle">
        <img src="@/assets/group.png" style="width:24px; height:24px; vertical-align: middle; margin-right: 8px;">
        Anonymous Questionnaire for Aesthetic Assessment
      </h2>
    </header>

    <div class="description" ref="questionIntro">
      <p><strong>Objective:</strong> To evaluate the quality of photographic works from multiple dimensions.</p>
      <p><strong>Note:</strong> For each question, please drag to rank all 4 images, and rate only the 4th image separately.</p>
      <p><strong>Questionnaire:</strong></p>
      <ol>
        <li>How well is the image composited?</li>
        <li>How well is the main subject emphasized?</li>
        <li>How well does the image highlight the relation between character and background?</li>
        <li>How well does the image tell a story?</li>
      </ol>
    </div>

    <div class="tips-bar">
      <p><strong>Tips:</strong> Click images to enlarge. Drag numbers to rank each group's 4 images per question. On desktop, double click (hold the second); 
        on mobile, press and hold or double click (hold the second)</p>
    </div>

    <div v-for="row in 3" :key="'row-' + row">
      <a-row :gutter="32" class="group-wrapper">
        <a-col 
          class="group-col"
          :xs="24"
          :sm="24"
          :md="12"
          :lg="12"
          :xl="12"
          :xxl="12" 
          v-for="col in 2" 
          :key="'group-' + ((row - 1) * 2 + col)"
        >
          <template v-if="(row - 1) * 2 + col <= 6">
            <div class="group-title">Group {{ (currentGroup - 1) * 6 + (row - 1) * 2 + col }}</div>

            <a-row :gutter="12">
              <a-col :span="12" v-for="i in 2" :key="i">
                <div class="image-container" @click="openPreview((row - 1) * 2 + col, i - 1)">
                  <img :src="getImagePath(groupImages((row - 1) * 2 + col)[i - 1])" class="grid-img" />
                  <div class="img-label">{{ i }}</div>
                </div>
              </a-col>
            </a-row>

            <a-row :gutter="12">
              <a-col :span="12" v-for="i in [3, 4]" :key="i">
                <div class="image-container" @click="openPreview((row - 1) * 2 + col, i - 1)">
                  <img :src="getImagePath(groupImages((row - 1) * 2 + col)[i - 1])" class="grid-img" />
                  <div class="img-label">{{ i }}</div>
                </div>
              </a-col>
            </a-row>

            <div
              class="ranking-section"
              v-for="(list, qIndex) in groupRankings[(currentGroup - 1) * 6 + (row - 1) * 2 + col - 1]"
              :key="'ranking-' + ((row - 1) * 2 + col) + '-' + qIndex"
            >
              <!-- move Q here -->
              <span class="ranking-title">Q{{ qIndex + 1 }}</span>
              <div class="ranking-bar">
                
                <span class="ranking-label">Best</span>
                <draggable
                  :list="groupRankings[(currentGroup - 1) * 6 + (row - 1) * 2 + col - 1][qIndex]"
                  @change="onRankingChange"
                  :options="{ animation: 200 }"
                  class="drag-list"
                  tag="div"
                >
                <!-- @update="event => onRankingChange(event, (currentGroup - 1) * 6 + (row - 1) * 2 + col - 1, qIndex)"
                  -->
                  <div
                    v-for="num in groupRankings[(currentGroup - 1) * 6 + (row - 1) * 2 + col - 1][qIndex]"
                    :key="num"
                    class="drag-number"
                  >
                    {{ (num % 4 === 0 ? 4 : num % 4) }}
                  </div>
                </draggable>
                <span class="ranking-label">Worst</span>

              </div>

              <!-- Add score for this Q -->
              <br />
              <div>
                <a-row>
                  <a-col :span="8" class="flex-center">
                    <span class="rating-text">Please rate the 4th image here:</span>
                  </a-col>
                  <a-col :span="7" class="flex-center">
                    <!-- <a-slider v-model="inputValue1" :min="1" :max="5" style="width: 100%; marginLeft: 16px; justify-content: center;"/> -->
                    <a-slider
                      v-model="groupRatings[(currentGroup - 1) * 6 + (row - 1) * 2 + col - 1][qIndex]"
                      :min="1"
                      :max="5"
                      style="width: 100%; margin-left: 16px; justify-content: center;"
                    />
                  </a-col>
                  <a-col :span="4" class="flex-center">
                    <!-- <a-input-number v-model="inputValue1" :min="1" :max="5" style="marginLeft: 16px" /> -->
                    <a-input-number
                      v-model="groupRatings[(currentGroup - 1) * 6 + (row - 1) * 2 + col - 1][qIndex]"
                      :min="1"
                      :max="5"
                      style="margin-left: 16px"
                    />
                  </a-col>
                </a-row>
                    
              </div>

            </div>


            

            

          </template>
        </a-col>
      </a-row>
    </div>

    <div style="text-align: center; margin-top: 24px">
      <a-pagination
        :current="currentGroup"
        :page-size="1"
        :total="Math.ceil(totalImages / 24)"
        @change="handleGroupChange"
        simple
      />
    </div>

    <a-modal :visible="previewVisible" :footer="null" :width="800" centered @cancel="previewVisible = false">
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

    <div style="text-align: center; margin-top: 24px;">
      <a-button v-if="currentGroup === Math.ceil(totalImages / 24)" type="primary" :loading="isSubmitting" @click="submitForm">
        Submit
      </a-button>
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
      inputValue: 0,
      inputValue1: 1,
      isSubmitting: false,
      groupRankings: [],
      groupRatings: []
    };
  },
  methods: {
    getImagePath(n) {
      return require(`@/assets/photo/${n}.jpg`);
    },
    groupImages(groupIdx) {
      const base = (this.currentGroup - 1) * 24 + (groupIdx - 1) * 4;
      return Array.from({ length: 4 }, (_, i) => base + i + 1);
    },
    onRankingChange(event, groupIdx, qIndex) {
      const elOrder = [...event.to.children].map(el => parseInt(el.textContent.trim()));
      const base = (this.currentGroup - 1) * 24 + groupIdx * 4;
      this.$set(this.groupRankings[groupIdx], qIndex, elOrder.map(n => base + ((n + 3) % 4)));
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
      this.$nextTick(() => {
        const intro = this.$refs.questionIntro;
        if (intro && intro.scrollIntoView) {
          intro.scrollIntoView({ behavior: "smooth" });
        }
      });
    },
    initRankings() {
      if (this.groupRankings.length > 0) return;
      const totalGroups = this.totalImages / 4;
      this.groupRankings = Array.from({ length: totalGroups }, (_, i) =>
        Array.from({ length: 4 }, () => [i * 4 + 1, i * 4 + 2, i * 4 + 3, i * 4 + 4])
      );
      // add ratings
      this.groupRatings = Array.from({ length: totalGroups }, () =>
        Array.from({ length: 4 }, () => 0) // 默认评分0分（或其他）
      );

    },
    submitForm() {
      this.isSubmitting = true;
      const payload = {
        groups: this.groupRankings.map((rankings, i) => ({
          groupIndex: i + 1,
          rankings,
          // add ratings
          ratings:this.groupRatings[i]
        }))
      };
      fetch("https://zhilan-leo-il-photography-backward.hf.space/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
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
  padding: 24px 24px;
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
  margin: 0 8px 5px; 
}
.tips-bar p {
  margin: 0 ;
}

 /* 每行（两组）的外层行距 */
.group-wrapper {
  padding: 5px 32px;
  margin-bottom: 32px;
}
@media (max-width: 768px) {
  .group-wrapper .group-col:nth-child(2) {
    margin-top: 32px;
  }
}


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
  margin-bottom: 12px;
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
  margin-right: 6px; /* */
}
.ranking-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: center;
  flex-wrap: nowrap;
  overflow-x: auto; 
}
.ranking-label {
  font-size: 14px;
  color: #999;
  min-width: 12px;
  text-align: center;
}
.drag-list {
  display: flex;
  gap: 6px;
  justify-content: center;
  flex-wrap: wrap;

  flex-shrink: 1;            /* 允许收缩以适应空间 */
  flex-grow: 1;              /* 允许拉伸 */
  min-width: 0;              /* 防止flex item超出 */
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


.flex-center {
  display: flex;
  align-items: center;   /* 垂直居中 */
  height: 100%;
}
.rating-text {
  font-size: 14px;
  color: #999;
  /* min-width: 12px;
  display: block;      
  margin-top: 8px;
  text-align: left; */
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
