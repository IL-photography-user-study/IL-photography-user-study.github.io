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
      <p><strong>Note:</strong> For each question, drag to rank all 4 images in the first step, and rate only the designated image individually in the second step.</p>
      <p><strong>Questionnaire:</strong></p>
      <ol>
        <li>How well is the image composited?</li>
        <li>How well is the main subject emphasized?</li>
        <li>How well does the image highlight the relation between character and background?</li>
        <li>How well does the image tell a story?</li>
      </ol>
    </div>

    <div class="tips-bar">
      <p><strong>Tips:</strong> Click images to enlarge. In the first step, drag the numbers to rank each group of four photos. In the second step, drag the slider to score the photos. On desktop, double click (hold the second); 
        on mobile, press and hold or double click (hold the second)</p>
    </div>

    <br>
    <div class="step-wrapper">
      <a-steps :current="current">
        <a-step v-for="item in steps" :key="item.title" :title="item.title" />
      </a-steps>
    </div>
    <div class="steps-content" v-if="current === 0" >
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
            <template v-if="(currentGroup - 1) * 6 + (row - 1) * 2 + col <= totalGroups">
            <!-- <template v-if="(row - 1) * 2 + col <= 6"> -->
              <!-- <div class="group-title">Group {{ (currentGroup - 1) * 6 + (row - 1) * 2 + col }}</div> -->

              <a-row :gutter="12">
                <a-col :span="12" v-for="i in 2" :key="i">
                  <div class="image-container" @click="openPreview((row - 1) * 2 + col, i - 1)">
                    <img :src="getImagePath(groupImagesShuffled((row - 1) * 2 + col)[i - 1])" class="grid-img" />
                    <div class="img-label">{{ i }}</div>
                  </div>
                </a-col>
              </a-row>

              <a-row :gutter="12">
                <a-col :span="12" v-for="i in [3, 4]" :key="i">
                  <div class="image-container" @click="openPreview((row - 1) * 2 + col, i - 1)">
                    <img :src="getImagePath(groupImagesShuffled((row - 1) * 2 + col)[i - 1])" class="grid-img" />
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
                    @change="event => onRankingChange(event, (currentGroup - 1) * 6 + (row - 1) * 2 + col - 1, qIndex)"
                    :options="{ animation: 200 }"
                    class="drag-list"
                    tag="div"
                  >
                    <div
                      v-for="num in groupRankings[(currentGroup - 1) * 6 + (row - 1) * 2 + col - 1][qIndex]"
                      :key="num"
                      class="drag-number"
                    >
                      <!-- 显示成 1-4，而不是 num 本身 -->
                      {{ groupOrders[(currentGroup - 1) * 6 + (row - 1) * 2 + col - 1].indexOf(num) + 1 }}
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
    </div>
    
    <div class="steps-content rate-content" v-if="current === 1">
      <div class="rating-summary">
        <a-row :gutter="[24, 24]">
          <a-col
            v-for="(ratings, index) in paginatedRatings"
            :key="'rate-group-' + realGroupIndex(index)"
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
            :xl="6"
          >
            <div class="rating-group-card">
              <img
                :src="getImagePath((realGroupIndex(index) * 4) + 1)"
                class="summary-img"
                @click="openPreview2(realGroupIndex(index))"
              />

              <div v-for="q in 4" :key="'rating-q' + q" class="rating-row">
                <span class="rating-text">Q{{ q }}:</span>
                <a-slider
                  v-model="groupRatings[realGroupIndex(index)][q - 1]"
                  :min="1"
                  :max="5"
                  style="width: 60%; display: inline-block; margin: 0 8px;"
                />
                <a-input-number
                  v-model="groupRatings[realGroupIndex(index)][q - 1]"
                  :min="1"
                  :max="5"
                />
              </div>
            </div>
          </a-col>
        </a-row>
        <div style="text-align: center; margin-top: 24px;">
          <a-pagination
            :current="currentRatePage"
            :page-size="16"
            :total="groupRatings.length"
            @change="page => currentRatePage = page"
            simple
          />
        </div>

        
      </div>
    </div>

    <div class="steps-action">
      <a-button v-if="current > 0" style="margin-right: 8px" @click="prev">
        Previous
      </a-button>
      <a-button 
        v-if="current < steps.length - 1" 
        :disabled="currentGroup < Math.ceil(totalImages / 24)" 
        type="primary" 
        @click="next"
      >
        Next
      </a-button>
      <a-button
        
        v-if="current == steps.length - 1 && currentRatePage == Math.ceil(groupRatings.length / 16)"
        type="primary"
        :loading="isSubmitting" 
        @click="submitForm"
      >
        Submit
      </a-button>
      
    </div>
    

    <a-modal :visible="previewVisible" :footer="null" :width="800" centered @cancel="previewVisible = false">
      <a-carousel ref="carousel" :dots="false" arrows :initial-slide="currentIndex" @afterChange="updateCurrentIndex">
        <div v-for="(img, idx) in previewGroupImages" :key="img">
          <img :src="getImagePath(img)" class="carousel-image" />
          <div class="preview-index" v-if="current === 0">{{ idx + 1 }}</div>
        </div>
      </a-carousel>

      <div class="thumbnail-bar" v-if="previewGroupImages.length > 1 && current === 0">
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
  </div>
  
</template>

<script>
import draggable from "vuedraggable";
export default {
  components: { draggable },
  data() {
    return {
      current: 0,
      steps: [
        {
          // title: 'Sorting',
        },
        {
          // title: 'Scoring',
        },

      ],
      currentGroup: 1,
      totalImages: 128,
      totalGroups: 32,
      previewVisible: false,
      currentIndex: 0,
      previewGroupImages: [],
      inputValue: 0,
      inputValue1: 1,
      isSubmitting: false,
      groupRankings: [],
      groupRatings: [],
      currentRatePage: 1, 
      groupOrders: [],
      originalRankings: {}
    };
  },
  computed:{
    paginatedRatings() {
      const start = (this.currentRatePage - 1) * 16;
      const end = start + 16;
      return this.groupRatings.slice(start, end);
    }
    
  },
  methods: {
    next() {
      this.current++;
    },
    prev() {
      this.current--;
    },

    getImagePath(n) {
      return require(`@/assets/photo/${n}.jpg`);
    },
    groupImages(groupIdx) {
      const base = (this.currentGroup - 1) * 24 + (groupIdx - 1) * 4;
      return Array.from({ length: 4 }, (_, i) => base + i + 1);
    },
    groupImagesShuffled(groupIdx) {
      // return this.groupOrders[(this.currentGroup - 1) * 6 + (groupIdx - 1)];
      const idx = (this.currentGroup - 1) * 6 + (groupIdx - 1);
      return this.groupOrders[idx] || this.groupOrders[0];
    },

    onRankingChange(event, groupIdx, qIndex) {
      const newOrder = this.groupRankings[groupIdx][qIndex];
      console.log("拖拽后的原始顺序:", newOrder);
      this.$set(this.groupRankings[groupIdx], qIndex, [...newOrder]);

    },
    
    openPreview(groupIdx, index) {
      this.previewGroupImages = this.groupImagesShuffled(groupIdx);
      this.currentIndex = index;
      this.previewVisible = true;
      this.$nextTick(() => this.$refs.carousel.goTo(index));
    },
    openPreview2(groupIdx) {
      const imageIndex = groupIdx * 4 + 1;
      this.previewGroupImages = [imageIndex];
      this.currentIndex = 0; 
      this.previewVisible = true;
      
      // const groupImages = Array.from({ length: 4 }, (_, i) => groupIdx * 4 + i + 1);
      // this.previewGroupImages = groupImages;
      // this.currentIndex = 3; // 第4张图的 index 是 3
      // this.previewVisible = true;
      // this.$nextTick(() => {
      //   this.$refs.carousel.goTo(3);
      // });
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
      
      // Shuffle the order of pictures
      this.groupOrders = Array.from({ length: totalGroups }, (_, g) => {
        const base = g * 4 + 1;
        const arr = [base, base + 1, base + 2, base + 3];
        return arr.sort(() => Math.random() - 0.5); // 随机打乱
      });

      this.groupOriginalOrders = Array.from({ length: totalGroups }, (_, i) =>
        Array.from({ length: 4 }, (_, j) => i * 4 + j + 1)
      );


      // this.groupRankings = Array.from({ length: totalGroups },() =>
      // // , (_, g) 
      // // Array.from({ length: 4 }, () => [i * 4 + 1, i * 4 + 2, i * 4 + 3, i * 4 + 4])
      //     Array.from({ length: 4 }, () => [1,2,3,4])

      // );
      this.groupRankings = Array.from({ length: totalGroups }, (_, g) =>
        Array.from({ length: 4 }, () => [...this.groupOrders[g]])
      );

      // add ratings
      this.groupRatings = Array.from({ length: totalGroups }, () =>
        Array.from({ length: 4 }, () => 0) // 默认评分0分（或其他）
      );

    },
    realGroupIndex(index) {
      return (this.currentRatePage - 1) * 16 + index;
    },

    submitForm() {
      this.isSubmitting = true;
      const payload = {
        groups: this.groupRankings.map((rankings, i) => ({
          groupIndex: i + 1,
          rankings,
          // rankings: rankings.original || rankings, // 提交原始顺序
          // rankings: Object.values((this.originalRankings && this.originalRankings[i]) || {}),
    
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
.steps-content {
  margin-top: 16px;
  border: 1px dashed #e9e9e9;
  border-radius: 6px;
  background-color: #fafafa;
  min-height: 200px;
  text-align: center;
  padding-top: 20px;
}

.steps-action {
  margin-top: 24px;
  margin-bottom: 24px;
  padding: 24px 24px;
  text-align: center
}



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

.step-wrapper {
  padding: 0 32px; /* 左右留出空间，可根据需要调整为16/24等 */
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


.rating-summary {
  padding: 0 24px;
  margin-top: 24px;
}

.rating-group-card {
  background: #f9f9f9;
  border: 1px dashed #ccc;
  border-radius: 6px;
  padding: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}

.summary-img {
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: contain;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 12px;
}

.rating-text {
  font-size: 14px;
  color: #555;
  margin-right: 6px;
}

.rating-row {
  display: flex;
  align-items: center;
  white-space: nowrap;
  gap: 8px; /* 组件间距，可以根据需要调整 */
  margin-bottom: 12px;
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

