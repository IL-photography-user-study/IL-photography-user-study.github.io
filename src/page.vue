<template> 
  <div>
    <header>
      <h1 class="title">FotoBot: Fully Autonomous Human-Centric Robot Photography in Real Life with Flow Matching Policy</h1>
      <h2 class="subtitle">
        <img src="@/assets/group.png" style="width:24px; height:24px; vertical-align: middle; margin-right: 8px;">
        Anonymous Questionnaire for Aesthetic Assessment
      </h2>
    </header>

    <!-- 说明 -->
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

      <p><strong>Questionnaire:</strong></p>
      <ol>
        <li>How well is the image composited? (Good/Medium/Bad)</li>
        <li>How well is the main subject emphasized? (Good/Medium/Bad)</li>
        <li>How well does the image highlight the relation between character and background? (Good/Medium/Bad)</li>
        <li>Overall aesthetic score (1–9)</li>
      </ol>
    </div>

    <div class="tips-bar">
      <p><strong>Tips:</strong> Click images to enlarge.</p>
    </div>

    <!-- isenthusiast & username -->
    <div>
      <a-modal 
        v-model="visible" 
        title="Some questions before you start" 
        :closable="false" 
        :maskClosable="false" 
        :keyboard="false" 
        @ok="handleOk">
        <div class="components-input-demo-presuffix">
          <span>Please enter your name here.</span>
          <br>
          <a-input v-model="userName" placeholder="" @pressEnter="handleOk">
            <a-icon slot="prefix" type="user" />
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
    </div>

    <br>
    <div class="step-wrapper">
      <a-steps :current="current">
        <a-step v-for="item in steps" :key="item.title" :title="item.title" />
      </a-steps>
    </div>

    <br>

    <!-- 仅保留答题页面 -->
    <div class="steps-content" v-if="current === 0">
      <div v-for="row in 4" :key="'row-' + row">
        <a-row :gutter="32" class="group-wrapper">
          <a-col
            class="group-col"
            :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12"
            v-for="col in 2"
            :key="'group-' + ((row - 1) * 2 + col)"
          >
            <template v-if="(currentGroup - 1) * 8 + (row - 1) * 2 + col <= totalGroups">
              <!-- 图片 1-4 -->
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

              <!-- 每个问题一行的表格 -->
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
                  <!-- 表头：Image 1,2,3,4 -->
                  <div class="ranking-header" style="display: table-row;">
                    <div v-for="n in list.length" :key="'header-' + n"
                         style="display: table-cell; text-align: center; padding: 4px; width: 25%;">
                      Image {{ n }}
                    </div>
                  </div>

                  <!-- 表格行：根据题目类型呈现 -->
                  <div class="ranking-row" style="display: table-row;">
                    <div
                      v-for="item in list"
                      :key="'cell-' + item.img + '-' + qIndex"
                      style="display: table-cell; text-align: center; padding: 4px;"
                    >
                      <!-- Q1-3: Good/Medium/Bad 单选 -->
                      <div v-if="qIndex < 3" style="display:flex; gap:8px; justify-content:center;">
                        <a-radio-group v-model="item.rank" size="small">
                          <a-radio :value="'good'">Good</a-radio>
                          <a-radio :value="'medium'">Medium</a-radio>
                          <a-radio :value="'bad'">Bad</a-radio>
                        </a-radio-group>
                      </div>

                      <!-- Q4: 1-9 分数 -->
                      <div v-else style="display:flex; flex-direction:column; align-items:center; gap:4px;">
                        <a-slider
                          v-model="item.rank"
                          :min="1"
                          :max="9"
                          :step="1"
                          :marks="{1:'1',2:'2',3:'3',4:'4',5:'5',6:'6',7:'7',8:'8',9:'9'}"
                          :handle-style="item.rank !== null ? {} : { opacity: 0 }"
                          @before-change="handleSliderStart(item)"
                          style="width: 80%; display: inline-block; margin: 0 8px;"
                        />
                        <!-- 如果值是 null，显示一个点击即可设置的“占位条” -->
                        <div
                          v-if="item.rank == null"
                          class="rating-placeholder"
                          @click="handlePlaceholderClick($event, item)"
                          style="width: 100%; height: 8px; background: #eee; display: inline-block; border-radius: 4px; cursor: pointer;"
                        ></div>

                        <a-input-number
                          v-model="item.rank"
                          :min="1"
                          :max="9"
                          style="width: 70%; display: inline-block; margin-top: 18px;"
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
                    placeholder="Write your comments here.
  On desktop, you can resize the comment box by dragging its bottom-right corner."
                    @pressEnter.native.prevent
                  />
                </a-form-item>
              </div>
              <!-- /每个问题 -->
            </template>        
          </a-col>
        </a-row>
      </div>

      <!-- 分页（组） -->
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

    <!-- 底部操作 -->
    <div class="steps-action">
      <a-button
        type="primary"
        :loading="isSubmitting"
        @click="submitForm"
      >
        Submit
      </a-button>
    </div>

    <!-- 预览大图 -->
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
      steps: [{ title: 'Questions' }],  // 只保留一个步骤
      currentGroup: 1,
      totalImages: 80,
      totalGroups: 20,

      previewVisible: false,
      currentIndex: 0,
      previewGroupImages: [],

      isSubmitting: false,

      // 分组数据
      groupRankings: [],   // [group][question(0..3)][imageIndex(0..3)] -> { img, rank }
      groupOrders: [],     // 每组打乱后的图片顺序
      groupOriginalOrders: [],

      //////////////////////////////Q4 rating
      groupRatings: [],
      currentRatePage: 1, 

      // 用户信息
      visible: true,
      userName: '',
      participantName: '',
      value: 1, // is enthusiast (1/0)

      // 备注
      groupComments: [],

      // 题目描述
      questionDescriptions: [
        "How well is the image composited?",
        "How well is the main subject emphasized?",
        "How well does the image highlight the relation between character and background?",
        "Overall aesthetic score (1–9)"
      ],

      // Q4 分数选项
      // scoreOptions: Array.from({ length: 9 }, (_, i) => ({ label: String(i + 1), value: i + 1 })),
    };
  },

  computed:{
    paginatedRatings() { ////////////////////////////////////////////
      const start = (this.currentRatePage - 1) * 16;
      const end = start + 16;
      return this.groupRatings.slice(start, end);
    }
  },

  methods: {
    onChange(e) {
      console.log('radio checked', e.target.value);
    },

    handleOk() {
      if (!this.userName.trim()) {
        this.$message.error("please enter your name!");
        return;
      }
      this.participantName = this.userName.trim();
      this.visible = false;
    },

    getImagePath(n) {
      return require(`@/assets/photo/${n}.jpg`);
    },
    groupImagesShuffled(groupIdx) {
      const idx = (this.currentGroup - 1) * 8 + (groupIdx - 1);
      return this.groupOrders[idx] || this.groupOrders[0];
    },

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

    handleSliderStart(item) {
      if (item.rank === 0 || item.rank === null) {
        this.$set(item, 'rank', 1);
      }
    },

    handlePlaceholderClick(event, item) {
      const el = event.currentTarget;
      const rect = el.getBoundingClientRect();
      const clickX = event.clientX - rect.left; // 点击相对位置
      const width = rect.width;

      const min = 1;
      const max = 9; // ⚠️ 这里改成 9，因为你 Q4 是 1–9 分制

      let score = Math.round((clickX / width) * (max - min) + min);
      if (score < min) score = min;
      if (score > max) score = max;

      this.$set(item, 'rank', score);
    },

    /////////////////////////////////
    openPreview2(groupIdx) {
      const imageIndex = groupIdx * 4 + 1;
      this.previewGroupImages = [imageIndex];
      this.currentIndex = 0; 
      this.previewVisible = true;
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

      // 每组四张图的打乱顺序
      this.groupOrders = Array.from({ length: totalGroups }, (_, g) => {
        const base = g * 4 + 1;
        const arr = [base, base + 1, base + 2, base + 3];
        return arr.sort(() => Math.random() - 0.5);
      });

      // 原顺序
      this.groupOriginalOrders = Array.from({ length: totalGroups }, (_, i) =>
        Array.from({ length: 4 }, (_, j) => i * 4 + j + 1)
      );

      // 初始化四个问题：Q1-3(分类)，Q4(1-9分)
      this.groupRankings = Array.from({ length: totalGroups }, (_, g) =>
        Array.from({ length: 4 }, () =>
          this.groupOrders[g].map(img => ({ img, rank: null }))
        )
      );

      // 每组评论
      this.groupComments = Array.from({ length: totalGroups }, () => '');
    },

    realGroupIndex(index) {////////////////////////////////////
      return (this.currentRatePage - 1) * 16 + index;
    },

    submitForm() {
      // 校验所有作答：Q1-3 必选 good/medium/bad；Q4 必选 1-9
      const invalid = this.groupRankings.some((group) =>
        group.some((questionItems, qIdx) =>
          questionItems.some(item => {
            if (item.rank === null || item.rank === undefined || item.rank === '') return true;
            if (qIdx === 3) {
              const v = Number(item.rank);
              return !(Number.isInteger(v) && v >= 1 && v <= 9);
            }
            // Q1-3
            return (qIdx < 3) && !['good', 'medium', 'bad'].includes(String(item.rank));
          })
        )
      );
      if (invalid) {
        this.$message.error("Please complete Q1–Q4 for every image before submitting!");
        return;
      }

      this.isSubmitting = true;

      // 还原到原图顺序的答案
      const payload = {
        participantName: this.participantName,
        answer: this.value, // 1:Yes; 0:No.
        groups: this.groupRankings.map((groupQuestions, groupIdx) => {
          const originalOrder = this.groupOriginalOrders[groupIdx];
          const shuffledOrder = this.groupOrders[groupIdx];

          const originalAnswers = groupQuestions.map(questionItems => {
            const userAnswers = questionItems.map(item => item.rank);
            // 映射回原始顺序(1..4)
            return originalOrder.map(img => {
              const shuffledIndex = shuffledOrder.indexOf(img);
              return userAnswers[shuffledIndex];
            });
          });

          return {
            groupIndex: groupIdx + 1,
            rankings: originalAnswers,  // 这里沿用原字段名，值为 good/medium/bad 或 1..9
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
.description p { margin: 4px 0; }
.description ol { padding-left: 20px; }

.tips-bar {
  text-align: center;
  margin-bottom: 10px; 
  background: #e6f7ff;
  padding: 5px;
  border: 1px solid #91d5ff;
  margin: 0 8px 5px; 
}
.tips-bar p { margin: 0 ; }

.step-wrapper { padding: 0 32px; }

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
