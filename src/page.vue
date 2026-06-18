<template> 
  <div>
    <header>
      <h1 class="title">Learning Embodied Aesthetics for Autonomous Robotic Photography</h1>
      <h2 class="subtitle">
        <img src="@/assets/group.png" style="width:24px; height:24px; vertical-align: middle; margin-right: 8px;">
        Anonymous Questionnaire for Aesthetic Assessment
      </h2>
    </header>

    <!-- Instructions -->
    <div class="description" ref="questionIntro">
      <p><strong>Objective:</strong> To evaluate the quality of photographic works from multiple dimensions.</p>
      <div class="note-section" style="margin-bottom: 16px;">
        <p><strong>Note:</strong></p>
        <ol>
          <p>- For each image, please answer Q1–Q4.</p>
          <p>- Q1–Q3: choose one from <em>Good / Medium / Bad</em>.</p>
          <p>- Q4: select an overall aesthetic score (1–9). Tip: 1–3 Poor, 4–6 Medium, 7–9 Good.</p>
        </ol>
      </div>

      <p><strong>Questions:</strong></p>
      <ol>
        <li>How well is the image composition?</li>
        <li>How well is the main subject emphasized? (considering the pose)</li>
        <li>How well is the relation between character and background in the image?</li>
        <li>Overall aesthetic score.</li>
      </ol>

      <p style="margin-top:12px; color:#1890ff; font-style:italic;">
        The image gallery consists of three parts categorized by the scene types: Indoor, Outdoor, and Mocap. 
        Currently, four images in each block are displayed in a fixed clockwise order: 1) BTS, 2) VS-RoT, 3) Ours, 4) Human.
      </p>

    </div>

    <div class="tips-bar">
      <p><strong>Tips:</strong> Click images to enlarge.
      <strong><u>No need to consider lighting, color tone, clarity, or background logo.</u></strong></p>
    </div>

    <!-- User info and enthusiast status -->
    <!-- <div>
      <a-modal 
        v-model="visible" 
        title="Some questions before you start" 
        :closable="false" 
        :maskClosable="false" 
        :keyboard="false" 
        @ok="handleOk">
        <div class="components-input-demo-presuffix">
          <span>Please fill your name and email address here. (Your name will be added to the acknowledgement)</span>
          <br>
          <a-input v-model="userName" placeholder="" @pressEnter="handleOk">
            <a-icon slot="prefix" type="mail" />
            <a-tooltip slot="suffix" title="Please enter your name">
              <a-icon type="info-circle" style="color: rgba(0,0,0,.45)" />
            </a-tooltip>
          </a-input>
        </div>
        <div>
          <br>
          <span>Are you a photography enthusiast?</span>
          <br>
          <a-radio-group v-model="value" @change="onChange">
            <a-radio :value="1">Yes</a-radio>
            <a-radio :value="0">No</a-radio>
          </a-radio-group>
        </div>
        <template #footer>
          <a-button type="primary" @click="handleOk">ok</a-button>
        </template>
      </a-modal>
    </div> -->

    <br>

    <!-- Main questionnaire -->
    <div class="steps-content" v-if="current === 0">
      <div v-for="row in 4" :key="'row-' + row">
        <!-- Section titles -->
        <template v-if="(currentGroup - 1) * 8 + (row - 1) * 2 + 1 === 1">
          <h2 style="margin-top:32px; text-align:center;">Indoor</h2>
        </template>
        <template v-if="(currentGroup - 1) * 8 + (row - 1) * 2 + 1 === 9">
          <h2 style="margin-top:32px; text-align:center;">Outdoor</h2>
        </template>
        <template v-if="(currentGroup - 1) * 8 + (row - 1) * 2 + 1 === 19">
          <h2 style="margin-top:32px; text-align:center;">Mocap</h2>
        </template>

        <a-row :gutter="32" class="group-wrapper">
          <a-col
            class="group-col"
            :xs="24" :sm="24" :md="24" :lg="12" :xl="12" :xxl="12"
            v-for="col in 2"
            :key="'group-' + ((row - 1) * 2 + col)"
          >
            <template v-if="(currentGroup - 1) * 8 + (row - 1) * 2 + col <= totalGroups">
              <h3 class="block-title">Block {{ (currentGroup - 1) * 8 + (row - 1) * 2 + col }}</h3>

              <!-- Images 1-4 -->
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

              <span><strong>Answer Q1–Q4 for each image</strong></span>

              <!-- Ranking table per question -->
              <div
                class="ranking-section"
                v-for="(list, qIndex) in groupRankings[(currentGroup - 1) * 8 + (row - 1) * 2 + col - 1]"
                :key="'ranking-' + ((row - 1) * 2 + col) + '-' + qIndex"
              >
                <span class="ranking-title">
                  Q{{ qIndex + 1 }} : {{ questionDescriptions[qIndex] }}
                  <template v-if="qIndex === 3">
                    <span style="color:#999; margin-left:8px;">(1–3 Poor · 4–6 Medium · 7–9 Good)</span>
                  </template>
                </span>

                <div class="ranking-table" style="display: table; table-layout: fixed; width: 100%; margin: 0 auto;">
                  <!-- Header row -->
                  <div class="ranking-header" style="display: table-row;">
                    <div v-for="n in list.length" :key="'header-' + n"
                        style="display: table-cell; text-align: center; padding: 4px; width: 25%;">
                      Image {{ n }}
                    </div>
                  </div>

                  <!-- Row for answers -->
                  <div class="ranking-row" style="display: table-row;">
                    <div
                      v-for="item in list"
                      :key="'cell-' + item.img + '-' + qIndex"
                      style="display: table-cell; text-align: center; padding: 4px;"
                    >
                      <!-- Q1-3: Good/Medium/Bad -->
                      <div v-if="qIndex < 3" style="display:flex; gap:8px; justify-content:center;">
                        <a-radio-group v-model="item.rank" size="small">
                          <a-radio :value="'good'">Good</a-radio>
                          <a-radio :value="'medium'">Medium</a-radio>
                          <a-radio :value="'bad'">Bad</a-radio>
                        </a-radio-group>
                      </div>

                      <!-- Q4: score slider/input -->
                      <div v-else style="display:flex; flex-direction:column; align-items:center; gap:4px;">
                        <a-slider
                          v-if="!isMobile"
                          v-model="item.rank"
                          :min="1"
                          :max="9"
                          :step="1"
                          :marks="{1:'1',2:'2',3:'3',4:'4',5:'5',6:'6',7:'7',8:'8',9:'9'}"
                          :handle-style="item.rank !== null ? {} : { opacity: 0 }"
                          @before-change="handleSliderStart(item)"
                          style="width: 80%; display: inline-block; margin: 0 8px;"
                        />
                        <!-- Placeholder bar for null values -->
                        <div
                          v-if="item.rank == null && !isMobile"
                          class="rating-placeholder"
                          @click="handlePlaceholderClick($event, item)"
                          style="width: 100%; height: 8px; background: #eee; display: inline-block; border-radius: 4px; cursor: pointer;"
                        ></div>

                        <a-input-number
                          v-model="item.rank"
                          :min="1"
                          :max="9"
                          :style="{
                            width: isMobile ? '100%' : '70%',
                            display: 'inline-block',
                            marginTop: '18px'
                          }"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Comments -->
              <div class="ranking-comment">
                <br>
                <a-form-item>
                  <a-textarea
                    :rows="2"
                    v-model="groupComments[(currentGroup - 1) * 8 + (row - 1) * 2 + col - 1]"
                    placeholder="Write your comments here. On desktop, you can resize the comment box."
                    @pressEnter.native.prevent
                  />
                </a-form-item>
              </div>
              
            </template>        
          </a-col>
        </a-row>
      </div>

      <!-- Pagination for groups -->
      <div style="text-align: center; margin-top: 24px">
        <a-pagination
          :current="currentGroup"
          :page-size="1"
          :total="Math.ceil(totalImages / 32)"
          @change="handleGroupChange"
          simple
        />
      </div>
    </div>

    <!-- Submit button -->
    <div class="steps-action">
      <a-button
        type="primary"
        :loading="isSubmitting"
        @click="submitForm"
      >
        Submit
      </a-button>
    </div>

    <!-- Image preview modal -->
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

<script lang="ts">
export default {
  data() {
    return {
      current: 0,
      currentGroup: 1,
      totalImages: 120,
      totalGroups: 30,

      previewVisible: false,
      currentIndex: 0,
      previewGroupImages: [],

      isSubmitting: false,

      groupRankings: [],
      groupOrders: [],
      groupOriginalOrders: [],
      groupComments: [],

      visible: true,
      userName: '',
      participantName: '',
      value: 1, // whether user is a photography enthusiast (1/0)

      questionDescriptions: [
        "How well is the image composition?",
        "How well is the main subject emphasized? (considering the pose)",
        "How well is the relation between character and background in the image?",
        "Overall aesthetic score."
      ],

      isMobile: window.innerWidth < 768,
    };
  },

  methods: {
    // Check if the device is mobile
    checkMobile() {
      this.isMobile = window.innerWidth < 768;
    },

    onChange(e) {
      console.log('radio checked', e.target.value);
    },

    // Confirm user info modal
    handleOk() {
      if (!this.userName.trim()) {
        this.$message.error("please enter your name!");
        return;
      }
      this.participantName = this.userName.trim();
      this.visible = false;
    },

    // Return image path
    getImagePath(n) {
      return require(`@/assets/photo/${n}.jpg`);
    },

    // Get shuffled images for the group
    groupImagesShuffled(groupIdx) {
      const idx = (this.currentGroup - 1) * 8 + (groupIdx - 1);
      return this.groupOrders[idx] || this.groupOrders[0];
    },

    // Open image preview modal
    openPreview(groupIdx, index) {
      this.previewGroupImages = this.groupImagesShuffled(groupIdx);
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

    // Initialize slider for Q4
    handleSliderStart(item) {
      if (item.rank === 0 || item.rank === null) {
        this.$set(item, 'rank', 1);
      }
    },

    // Click on placeholder to set score
    handlePlaceholderClick(event, item) {
      const el = event.currentTarget;
      const rect = el.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const width = rect.width;

      const min = 1;
      const max = 9;
      let score = Math.round((clickX / width) * (max - min) + min);
      if (score < min) score = min;
      if (score > max) score = max;

      this.$set(item, 'rank', score);
    },

    // Change current group
    handleGroupChange(p) {
      this.currentGroup = p;
      this.$nextTick(() => {
        const intro = this.$refs.questionIntro;
        if (intro && intro.scrollIntoView) {
          intro.scrollIntoView({ behavior: "smooth" });
        }
      });
    },

    // Initialize rankings and group orders
    initRankings() {
      if (this.groupRankings.length > 0) return;
      const totalGroups = this.totalImages / 4;

      this.groupOrders = Array.from({ length: totalGroups }, (_, g) => {
        const base = g * 4 + 1;
        return [base + 3, base + 2, base + 1, base];
      });

      this.groupOriginalOrders = Array.from({ length: totalGroups }, (_, i) =>
        Array.from({ length: 4 }, (_, j) => i * 4 + j + 1)
      );

      this.groupRankings = Array.from({ length: totalGroups }, (_, g) =>
        Array.from({ length: 4 }, () =>
          this.groupOrders[g].map(img => ({ img, rank: null }))
        )
      );

      this.groupComments = Array.from({ length: totalGroups }, () => '');
    },

    // Submit form data
    submitForm() {
      const invalid = this.groupRankings.some((group) =>
        group.some((questionItems, qIdx) =>
          questionItems.some(item => {
            if (item.rank === null || item.rank === undefined || item.rank === '') return true;
            if (qIdx === 3) {
              const v = Number(item.rank);
              return !(Number.isInteger(v) && v >= 1 && v <= 9);
            }
            return (qIdx < 3) && !['good', 'medium', 'bad'].includes(String(item.rank));
          })
        )
      );

      if (invalid) {
        this.$message.error("Please check the unfilled questions!");
        return;
      }

      this.isSubmitting = true;

      const payload = {
        participantName: this.participantName,
        answer: this.value,
        groups: this.groupRankings.map((groupQuestions, groupIdx) => {
          const originalOrder = this.groupOriginalOrders[groupIdx];
          const shuffledOrder = this.groupOrders[groupIdx];

          const originalAnswers = groupQuestions.map(questionItems => {
            const userAnswers = questionItems.map(item => item.rank);
            return originalOrder.map(img => {
              const shuffledIndex = shuffledOrder.indexOf(img);
              return userAnswers[shuffledIndex];
            });
          });

          return {
            groupIndex: groupIdx + 1,
            rankings: originalAnswers,
            comments: this.groupComments[groupIdx]
          };
        })
      };

      console.log(payload);

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
    },
  },

  mounted() {
    this.initRankings();
    window.addEventListener("resize", this.checkMobile);
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.checkMobile);
  },
};
</script>

<style scoped>
.steps-content {
  margin-top: 16px;
  border: 1px dashed #e9e9e9;
  border-radius: 6px;
  background-color: #fafafa;
  text-align: center;
  padding-top: 20px;
}

.steps-action {
  margin: 24px 0;
  padding: 24px;
  text-align: center;
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
  padding: 24px;
  margin-bottom: 16px;
  background-color: #fafafa;
  border-left: 4px solid #1890ff;
  font-size: 14px;
  line-height: 1.6;
}

.description p { margin: 4px 0; }
.description ol { padding-left: 20px; }

.tips-bar {
  text-align: center;
  background: #e6f7ff;
  padding: 5px;
  border: 1px solid #91d5ff;
  margin: 0 8px 5px; 
}

.group-wrapper {
  padding: 5px 32px;
  margin-bottom: 32px;
}

@media (max-width: 768px) {
  .group-wrapper .group-col:nth-child(2) { margin-top: 32px; }
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
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #d0d0d0;
}

.ranking-title { font-weight: bold; margin-right: 6px; }

.carousel-image { width: 100%; object-fit: contain; position: relative; }

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

.thumbnail.active { border-color: #1890ff; }
.thumbnail img { width: 100%; height: 100%; object-fit: cover; }
</style>
