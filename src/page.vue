<template>
  <div>
    <header>
      <h1 class="title">Fotobot: Flow Matching Policies for Autonomous Portrait Photography Robot</h1>
      <h2 class="subtitle">
        <img src="@/assets/group.png" style="width:24px; height:24px; vertical-align: middle; margin-right: 8px;">
        Anonymous Questionnaire for Aesthetic Assessment
      </h2>
    </header>
    <!-- Note for ranking -->
    <div class="description" ref="questionIntro">
      <p><strong>Objective:</strong> To evaluate the quality of photographic works from multiple dimensions.</p>
      <div v-if="current === 0" class="note-section" style="margin-bottom: 16px;">
        <p><strong>Note:</strong></p>
        <ol>
          Use the dropdown selector under each image to assign its rank. 
          <p>- Multiple images can share the same rank.</p>
          <p>- After tied ranks, the next rank skips the occupied positions (discontinuous ranking).</p>
        </ol>
      </div>
      <!-- Note for rating -->
      <div v-else-if="current === 1" class="note-section" style="margin-bottom: 16px;">
        <p><strong>Note:</strong></p>
        <ol>
          Use the slider to score each designated image.  
          <p>-  The scoring range is 1 ~ 5.</p>
          <p>-  Click the slider to activate and select a score, or enter the score directly in the input box.</p>
        </ol>
      </div>

      <p><strong>Questionnaire:</strong></p>
      <ol>
        <li>How well is the image composited?</li>
        <li>How well is the main subject emphasized?</li>
        <li>How well does the image highlight the relation between character and background?</li>
        <li>How well does the image tell a story?</li>
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
            <a-radio :value="1">
              Yes
            </a-radio>
            <a-radio :value="0">
              No
            </a-radio>
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
    <a-collapse v-if="current === 0" v-model="activeKey">
      <a-collapse-panel key="1" header="Examples">
        <!-- Example 1 -->
        <div style="margin-bottom: 20px;">
          <p><strong>Example 1:</strong> Choose a rank for each photo using the drop-down box.</p>
          <div class="ranking-table" style="display: table; margin: 0 auto;">
            <!-- 表头 -->
            <div class="ranking-header" style="display: table-row;">
              <div v-for="n in 4" :key="'header1-' + n"
                  style="display: table-cell; text-align: center; padding: 6px;">
                Image {{ n }}
              </div>
            </div>
            <!-- 示例行：3214 -->
            <div class="ranking-row" style="display: table-row;">
              <div v-for="(rank, idx) in [3,2,1,4]" :key="'ex1-' + idx"
                  style="display: table-cell; text-align: center; padding: 6px;">
                <a-select v-model="example1[idx]" style="width: 70px">
                  <a-select-option v-for="n in 4" :key="n" :value="n">{{ n }}</a-select-option>
                </a-select>
              </div>
            </div>
          </div>
        </div>

        <!-- Example 2 -->
        <div>
          <p><strong>Example 2:</strong> Ties are allowed. If a tie occurs, the next photo will jump by the number of photos tied.
In the example below, two photos tied for 2nd place → the next photo is 4th place.</p>

          <div class="ranking-table" style="display: table; margin: 0 auto;">
            <!-- 表头 -->
            <div class="ranking-header" style="display: table-row;">
              <div v-for="n in 4" :key="'header2-' + n"
                  style="display: table-cell; text-align: center; padding: 6px;">
                Image {{ n }}
              </div>
            </div>
            <!-- 示例行：2241 -->
            <div class="ranking-row" style="display: table-row;">
              <div v-for="(rank, idx) in [2,2,4,1]" :key="'ex2-' + idx"
                  style="display: table-cell; text-align: center; padding: 6px;">
                <a-select v-model="example2[idx]" style="width: 70px">
                  <a-select-option v-for="n in 4" :key="n" :value="n">{{ n }}</a-select-option>
                </a-select>
              </div>
            </div>
          </div>
        </div>
      </a-collapse-panel>
    </a-collapse>
    


    <div class="steps-content" v-if="current === 0" >
      <div v-for="row in 4" :key="'row-' + row">
        <a-row :gutter="32" class="group-wrapper">
          <a-col class="group-col" :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12" v-for="col in 2" :key="'group-' + ((row - 1) * 2 + col)">
            <template v-if="(currentGroup - 1) * 8 + (row - 1) * 2 + col <= totalGroups">
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
              
              
              <span><strong>Choose the ranking for each image below</strong></span>
              <div
                class="ranking-section"
                v-for="(list, qIndex) in groupRankings[(currentGroup - 1) * 8 + (row - 1) * 2 + col - 1]"
                :key="'ranking-' + ((row - 1) * 2 + col) + '-' + qIndex"
              >
                <!-- move Question here -->
                <span class="ranking-title">Q{{ qIndex + 1 }} : {{ questionDescriptions[qIndex] }}</span>
                <div class="ranking-table" style="display: table; margin: 0 auto;">
                  <!-- 表头：Image 1,2,3,4 -->
                  <div class="ranking-header" style="display: table-row;">
                    <div v-for="n in list.length" :key="'header-' + n"
                        style="display: table-cell; text-align: center; padding: 4px;">
                      Image {{ n }}
                    </div>
                  </div>
                  <!-- 表格行：下拉框 -->
                  <div class="ranking-row" style="display: table-row;">
                    <div v-for="item in list" :key="'select-' + item.img"
                        style="display: table-cell; text-align: center; padding: 4px;">
                      <a-select
                        v-model="item.rank"
                        style="width: 70px"
                        :placeholder="'Select rank'"
                        :options="rankOptions"
                      />
                    </div>
                  </div>
                  <!-- <div class="ranking-row" style="display: flex; gap: 12px; justify-content: center;">
                    <div v-for="item in list" :key="item.img" class="ranking-cell">
                      <a-select
                        v-model="item.rank"
                        style="width: 70px"
                        
                        :options="rankOptions"
                      >
                      </a-select>
                    </div>
                  </div> -->
                </div>  
              </div>
            </template>

            <!-- Comments -->
            <div class="ranking-comment">
              <br>
              <a-form-item>
                <a-textarea
                  :rows="2"
                  v-model="groupComments[(currentGroup - 1) * 8 + (row - 1) * 2 + col - 1]"
                  placeholder="Write your comments here.
You can resize the comment box by dragging its bottom-right corner."
                  @pressEnter.native.prevent
                />
              </a-form-item>
            </div>

          </a-col>
        </a-row>
        
      </div>

      <!-- pages -->
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
    
    <!-- rate -->
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
                <!-- <a-slider
                  v-model="groupRatings[realGroupIndex(index)][q - 1]"
                  :min="1"
                  :max="5"
                  :step="1"

                  :tooltip-visible="groupRatings[realGroupIndex(index)][q - 1] !== null && groupRatings[realGroupIndex(index)][q - 1] !== 0"
                  :marks="{1:'1',2:'2',3:'3',4:'4',5:'5'}"
                  :handle-style="groupRatings[realGroupIndex(index)][q - 1] > 0 ? {} : { opacity: 0 }"
                  @before-change="handleSliderStart(realGroupIndex(index), q - 1)"

                  style="width: 60%; display: inline-block; margin: 0 8px;"
                /> -->
                <a-slider
                  v-model="groupRatings[realGroupIndex(index)][q - 1]"
                  :min="1"
                  :max="5"
                  :step="1"
                  :marks="{1:'1',2:'2',3:'3',4:'4',5:'5'}"
                  :handle-style="groupRatings[realGroupIndex(index)][q - 1] !== null ? {} : { opacity: 0 }"
                  @before-change="handleSliderStart(realGroupIndex(index), q - 1)"
                  style="width: 60%; display: inline-block; margin: 0 8px;"
                />


                <!-- 如果值是 null，显示一个点击即可设置的“占位条” -->
                <div
                  v-if="groupRatings[realGroupIndex(index)][q - 1] == null"
                  class="rating-placeholder"
                  @click="handlePlaceholderClick($event, realGroupIndex(index), q - 1)"
                  style="width: 60%; height: 8px; background: #eee; display: inline-block; border-radius: 4px; cursor: pointer;"
                ></div>

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
        :disabled="currentGroup < Math.ceil(totalImages / 32)" 
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

<script lang="ts">
// interface RankingItem {
//   img: number;
//   rank: number | null;
// }

// interface GroupRanking {
//   groupIndex: number;
//   rankings: RankingItem[];
//   ratings: number[];
// }

export default {
  // components: { draggable },
  data() {
    return {
      current: 0,
      steps: [
        {
          // title: 'Sorting',
        },
        {},

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
      // originalRankings: {},
      
      // username
      visible: true,
      userName: '',
      participantName: '',

      // isenthusiast
      value: 1,

      // example
      activeKey: ['1'], // 默认展开 Example
      example1: [3, 2, 1, 4], // 默认值
      example2: [2, 2, 4, 1], // 默认值

      // comments
      groupComments: [],

      questionDescriptions: [
        "How well is the image composited?",
        "How well is the main subject emphasized?",
        "How well does the image highlight the relation between character and background?",
        "How well does the image tell a story?"
      ],


      rankOptions: [
        { label: "1", value: 1 },
        { label: "2", value: 2 },
        { label: "3", value: 3 },
        { label: "4", value: 4 }
      ]
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
      // 校验 ranking
      if (this.current === 0) {
        const unfilled = this.groupRankings.some(group =>
          group.some(question =>
            question.some(item => item.rank === null)
          )
        );
        if (unfilled) {
          this.$message.error("Please complete all rankings before proceeding!");
          return;
        }
      }
      this.current++;
      this.$nextTick(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth"  // 平滑滚动
        });
      });

    },
    prev() {
      this.current--;
    },

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


    // handleChange(value) {
    //   console.log(`selected ${value}`);
    // },

    handleSliderStart(groupIdx, qIdx) {
      if (this.groupRatings[groupIdx][qIdx] === 0 || this.groupRatings[groupIdx][qIdx] === null) {
        // 第一次操作，初始化为 1
        this.$set(this.groupRatings[groupIdx], qIdx, 1);
      }
    },

    handlePlaceholderClick(event, groupIdx, qIdx) {
      const el = event.currentTarget;
      const rect = el.getBoundingClientRect();
      const clickX = event.clientX - rect.left; // 点击相对元素左边位置
      const width = rect.width;

      const min = 1;
      const max = 5;

      // 计算分数
      let score = Math.round((clickX / width) * (max - min) + min);
      if (score < min) score = min;
      if (score > max) score = max;

      // 设置到 groupRatings
      this.$set(this.groupRatings[groupIdx], qIdx, score);
    },

    
    // getAvailableRanks(groupIdx, qIndex, currentImg) {
    //   // 获取当前问题的所有图片
    //   var question = (this.groupRankings && this.groupRankings[groupIdx] && this.groupRankings[groupIdx][qIndex]) || [];

    //   // 收集已经被其他图片选的 rank
    //   var usedRanks = question
    //     .filter(function(i) { return i.img !== currentImg })
    //     .map(function(i) { return i.rank })
    //     .filter(function(r) { return r !== null && r !== undefined });

    //   // 返回 options，并禁用已用的 rank
    //   return this.rankOptions.map(function(option) {
    //     return {
    //       label: option.label,
    //       value: option.value,
    //       disabled: usedRanks.indexOf(option.value) !== -1
    //     };
    //   });
    // },

    // getAvailableRanks(groupIdx: number, qIndex: number): Array<{ label: string; value: number; disabled?: boolean }> {
    //   const questionGroup = this.groupRankings[groupIdx];
    //   if (!questionGroup) return [];

    //   const question = questionGroup[qIndex];
    //   if (!question) return [];

    //   const maxRank = 4;

    //   const rankCounts: Record<number, number> = {};
    //   question.forEach(item => {
    //     if (item.rank != null && item.rank > 0) {
    //       rankCounts[item.rank] = (rankCounts[item.rank] || 0) + 1;
    //     }
    //   });

    //   const available: { label: string; value: number; disabled?: boolean }[] = [];
    //   for (let r = 1; r <= maxRank; r++) {
    //     let totalUsed = 0;
    //     for (let k = 1; k <= r; k++) {
    //       totalUsed += rankCounts[k] || 0;
    //     }

    //     available.push({
    //       label: r.toString(),
    //       value: r,
    //       disabled: totalUsed >= maxRank
    //     });
    //   }

    //   return available;
    // },





    getImagePath(n) {
      return require(`@/assets/photo/${n}.jpg`);
    },
    groupImages(groupIdx) {
      const base = (this.currentGroup - 1) * 24 + (groupIdx - 1) * 4;
      return Array.from({ length: 4 }, (_, i) => base + i + 1);
    },
    groupImagesShuffled(groupIdx) {
      // return this.groupOrders[(this.currentGroup - 1) * 8 + (groupIdx - 1)];
      const idx = (this.currentGroup - 1) * 8 + (groupIdx - 1);
      return this.groupOrders[idx] || this.groupOrders[0];
    },

    onRankingChange(event, groupIdx, qIndex) {
      const newOrder = this.groupRankings[groupIdx][qIndex];
      this.$set(this.groupRankings[groupIdx], qIndex, [...newOrder]);
    },
    
    // toggleRank(groupIdx, qIndex, img, rank, checked) {
    //   const item = this.groupRankings[groupIdx][qIndex].find(i => i.img === img);
    //   if (!item) return;

    //   if (checked) {
    //     if (!item.rank.includes(rank)) item.rank.push(rank);
    //   } else {
    //     item.rank = item.rank.filter(r => r !== rank);
    //   }
    // },

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

      // this.groupRankings = Array.from({ length: totalGroups }, (_, g) =>
      //   Array.from({ length: 4 }, () => [...this.groupOrders[g]])
      // );
      this.groupRankings = Array.from({ length: totalGroups }, (_, g) =>
        Array.from({ length: 4 }, () =>
          this.groupOrders[g].map(img => ({ img, rank: null }))
        )
      );

      this.groupComments = Array.from({ length: totalGroups }, () =>''
        // Array.from({ length: 4 }, () => '')
      );

      this.groupRatings = Array.from({ length: totalGroups }, () =>
        Array.from({ length: 4 }, () => null) // 默认评分0分（或其他）
      );

    },
    realGroupIndex(index) {
      return (this.currentRatePage - 1) * 16 + index;
    },

    submitForm() {
      // 校验 rating
      const unfilledRating = this.groupRatings.some(group =>
        group.some(score => !score || score === 0)
      );
      if (unfilledRating) {
        this.$message.error("Please complete all ratings before submitting!");
        return;
      }


      this.isSubmitting = true;

      const payload = {
        participantName: this.participantName,  // username
        answer: this.value,// 1:Yes; 0:No.
        groups: this.groupRankings.map((groupQuestions, groupIdx) => {
          const originalOrder = this.groupOriginalOrders[groupIdx]; 
          const shuffledOrder = this.groupOrders[groupIdx]; 

          // 每个问题都要单独处理
          const originalRanks = groupQuestions.map(questionItems => {
            const userRanks = questionItems.map(item => item.rank);
            // 映射回原始顺序
            return originalOrder.map(img => {
              const shuffledIndex = shuffledOrder.indexOf(img);
              return userRanks[shuffledIndex];
            });
          });

          return {
            groupIndex: groupIdx + 1,
            rankings: originalRanks,  // 二维数组 [ [..], [..], [..], [..] ]
            ratings: this.groupRatings[groupIdx],
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
    }


    // submitForm() {
    //   this.isSubmitting = true;
      
    //   const payload = {
    //     groups: this.groupRankings.map((groupQuestions, groupIdx) => {
    //       const originalOrder = this.groupOriginalOrders[groupIdx]; 
    //       const shuffledOrder = this.groupOrders[groupIdx]; 

    //       // 每个问题都要单独处理
    //       const originalRanks = groupQuestions.map(questionItems => {
    //         const userRanks = questionItems.map(item => item.rank);
    //         // 映射回原始顺序
    //         return originalOrder.map(img => {
    //           const shuffledIndex = shuffledOrder.indexOf(img);
    //           return userRanks[shuffledIndex];
    //         });
    //       });

    //       return {
    //         groupIndex: groupIdx + 1,
    //         rankings: originalRanks,  // 二维数组 [ [..], [..], [..], [..] ]
    //         ratings: this.groupRatings[groupIdx]
    //       };
    //     })
    //   };

    //   console.log(payload);

    //   fetch("https://zhilan-leo-il-photography-backward.hf.space/submit", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(payload)
    //   })
    //     .then(response => {
    //       if (!response.ok) throw new Error("Network response was not ok");
    //       return response.json();
    //     })
    //     .then(data => {
    //       console.log("submit:", data);
    //       this.$router.push("/thanks");
    //     })
    //     .catch(err => {
    //       console.error("submit error:", err);
    //       this.$message.error("Failed");
    //     })
    //     .finally(() => (this.isSubmitting = false));
    //   }


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
  margin-top: 12px;
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

