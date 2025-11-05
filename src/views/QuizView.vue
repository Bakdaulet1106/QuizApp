<template>
  <div class="quiz-view">
    <div class="container" v-if="currentQuiz">
      <!-- Quiz Header -->
      <div class="quiz-header">
        <div class="quiz-info">
          <div class="quiz-title-section">
            <h1 class="quiz-title">{{ currentQuiz.title }}</h1>
            <div class="quiz-actions">
              <BaseButton 
                @click="showQuizInfo = !showQuizInfo" 
                variant="outline" 
                size="small"
              >
                <span class="button-icon">ℹ️</span>
                Ақпарат
              </BaseButton>
              <BaseButton 
                @click="pauseQuiz" 
                variant="outline" 
                size="small"
                v-if="isQuizActive && !showResults"
              >
                <span class="button-icon">⏸️</span>
                Тоқтату
              </BaseButton>
              <BaseButton 
                @click="resumeQuiz" 
                variant="primary" 
                size="small"
                v-else-if="!showResults"
              >
                <span class="button-icon">▶️</span>
                Жалғастыру
              </BaseButton>
            </div>
          </div>
          
          <div class="quiz-meta">
            <div class="meta-item">
              <span class="meta-icon">❓</span>
              <span class="meta-text">{{ currentQuiz.questions.length }} сұрақ</span>
            </div>
            <div class="meta-item">
              <span class="meta-icon">⏱️</span>
              <span class="meta-text">{{ formatTime(currentQuiz.duration) }}</span>
            </div>
            <div class="meta-item" v-if="currentQuiz.category">
              <span class="meta-icon">📁</span>
              <span class="meta-text">{{ currentQuiz.category }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-icon">📊</span>
              <span class="meta-text">{{ completedQuestions }}/{{ currentQuiz.questions.length }} жауапталды</span>
            </div>
          </div>

          <!-- Quiz Description -->
          <div class="quiz-description" v-if="showQuizInfo">
            <p>{{ currentQuiz.description }}</p>
            <div class="quiz-instructions">
              <h4>Нұсқаулар:</h4>
              <ul>
                <li>Әрбір сұраққа бір рет жауап беруге болады</li>
                <li>Уақыт аяқталғаннан кейін тест автоматты түрде аяқталады</li>
                <li>Алдыңғы сұраққа қайтуға болады</li>
                <li>Соңғы сұрақтан кейін тестті аяқтау түймесі пайда болады</li>
              </ul>
            </div>
          </div>
        </div>
        
        <QuizTimer
          :duration="currentQuiz.duration"
          :isActive="isQuizActive && !showResults"
          @time-up="handleTimeUp"
          :showControls="true"
          @pause="pauseQuiz"
          @resume="resumeQuiz"
          class="quiz-timer"
        />
      </div>

      <!-- Quiz Progress -->
      <div class="quiz-progress-section">
        <div class="progress-info">
          <span class="progress-text">Сұрақ {{ currentQuestionIndex + 1 }} / {{ currentQuiz.questions.length }}</span>
          <span class="progress-percentage">{{ progressPercentage }}%</span>
        </div>
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>
      </div>

      <!-- Current Question -->
      <div class="question-section" v-if="currentQuestion && !showResults">
        <QuestionDisplay
          :question="currentQuestion"
          :currentQuestionIndex="currentQuestionIndex"
          :totalQuestions="currentQuiz.questions.length"
          :selectedAnswer="userAnswers[currentQuestionIndex]"
          @answer-select="handleAnswerSelect"
          @next="nextQuestion"
          @previous="previousQuestion"
          @complete="submitQuiz"
        />
      </div>

      <!-- Results View -->
      <div class="results-section" v-if="showResults && currentResult">
        <ResultsView
          :result="currentResult"
          :previousAttempts="previousAttempts"
          @retry-quiz="retryQuiz"
          @back-to-quizzes="backToQuizzes"
        />
      </div>

      <!-- Question Navigation -->
      <div class="question-navigation" v-if="!showResults">
        <h3>Сұрақтарға навигация</h3>
        <div class="navigation-grid">
          <button
            v-for="(question, index) in currentQuiz.questions"
            :key="index"
            @click="goToQuestion(index)"
            :class="[
              'nav-button',
              {
                'answered': userAnswers[index] !== undefined,
                'current': index === currentQuestionIndex,
                'visited': visitedQuestions.includes(index)
              }
            ]"
            :title="`Сұрақ ${index + 1}`"
          >
            {{ index + 1 }}
            <div class="answer-status" v-if="userAnswers[index] !== undefined">
              {{ userAnswers[index] !== undefined ? '✓' : '' }}
            </div>
          </button>
        </div>
      </div>

      <!-- Quiz Controls -->
      <div class="quiz-controls" v-if="!showResults">
        <div class="controls-left">
          <BaseButton
            @click="previousQuestion"
            :disabled="currentQuestionIndex === 0"
            variant="outline"
            class="control-button"
          >
            <span class="button-icon">←</span>
            Алдыңғы
          </BaseButton>
        </div>
        
        <div class="controls-center">
          <BaseButton
            @click="markForReview"
            variant="outline"
            size="small"
            class="review-button"
          >
            <span class="button-icon" v-if="reviewQuestions.includes(currentQuestionIndex)">✅</span>
            <span class="button-icon" v-else>🔖</span>
            {{ reviewQuestions.includes(currentQuestionIndex) ? 'Қаралды' : 'Қарау үшін белгілеу' }}
          </BaseButton>
        </div>
        
        <div class="controls-right">
          <BaseButton
            v-if="currentQuestionIndex < currentQuiz.questions.length - 1"
            @click="nextQuestion"
            :disabled="userAnswers[currentQuestionIndex] === undefined"
            variant="primary"
            class="control-button"
          >
            Келесі
            <span class="button-icon">→</span>
          </BaseButton>
          
          <BaseButton
            v-else
            @click="submitQuiz"
            :disabled="userAnswers[currentQuestionIndex] === undefined"
            variant="success"
            class="control-button"
            :isLoading="resultsStore.isLoading"
          >
            <span class="button-icon">🏁</span>
            Тестті аяқтау
          </BaseButton>
        </div>
      </div>

      <!-- Review Questions Panel -->
      <div class="review-panel" v-if="reviewQuestions.length > 0 && !showResults">
        <div class="review-header">
          <h4>Қарау үшін белгіленген сұрақтар</h4>
          <span class="review-count">{{ reviewQuestions.length }}</span>
        </div>
        <div class="review-questions">
          <button
            v-for="questionIndex in reviewQuestions"
            :key="questionIndex"
            @click="goToQuestion(questionIndex)"
            class="review-question-btn"
            :class="{ current: currentQuestionIndex === questionIndex }"
          >
            {{ questionIndex + 1 }}
          </button>
        </div>
      </div>
    </div>

    <LoadingSpinner v-else-if="quizStore.isLoading" class="loading-center" />

    <div v-else class="error-state">
      <div class="error-icon">❌</div>
      <h3>Тест табылмады</h3>
      <p>Сіз іздеген тест жоқ немесе оған қол жеткізу мүмкін емес.</p>
      <div class="error-actions">
        <BaseButton @click="$router.push('/quizzes')" variant="primary">
          Тесттер тізіміне оралу
        </BaseButton>
        <BaseButton @click="$router.go(-1)" variant="outline">
          Артқа оралу
        </BaseButton>
      </div>
    </div>

    <!-- Submit Confirmation Modal -->
    <BaseModal
      v-model:isOpen="showSubmitModal"
      title="Тестті аяқтауға сенімдісіз бе?"
      size="small"
    >
      <div class="submit-modal-content">
        <div class="warning-icon">⚠️</div>
        <p>Тестті аяқтағаннан кейін жауаптарды өзгерту мүмкін емес.</p>
        
        <div class="quiz-summary">
          <div class="summary-item">
            <span>Жауап берілген сұрақтар:</span>
            <strong>{{ answeredQuestions }}/{{ currentQuiz?.questions.length }}</strong>
          </div>
          <div class="summary-item">
            <span>Қарау үшін белгіленген:</span>
            <strong>{{ reviewQuestions.length }}</strong>
          </div>
          <div class="summary-item">
            <span>Қалған уақыт:</span>
            <strong>{{ formatTime(timeRemaining) }}</strong>
          </div>
        </div>
        
        <template #footer>
          <BaseButton @click="showSubmitModal = false" variant="outline">
            Жалғастыру
          </BaseButton>
          <BaseButton @click="confirmSubmit" variant="primary" :isLoading="resultsStore.isLoading">
            Ия, аяқтау
          </BaseButton>
        </template>
      </div>
    </BaseModal>

    <!-- Pause Confirmation Modal -->
    <BaseModal
      v-model:isOpen="showPauseModal"
      title="Тестті тоқтату"
      size="small"
    >
      <div class="pause-modal-content">
        <div class="pause-icon">⏸️</div>
        <p>Тест тоқтатылды. Сіздің прогрессіңіз сақталады және кейінірек жалғастыра аласыз.</p>
        
        <div class="pause-options">
          <BaseButton @click="resumeQuiz" variant="primary" class="pause-option-btn">
            Жалғастыру
          </BaseButton>
          <BaseButton @click="saveAndExit" variant="outline" class="pause-option-btn">
            Сақтап шығу
          </BaseButton>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuizStore } from '../stores/quizzes'
import { useResultsStore } from '../stores/results'
import { StorageService } from '../services/storageService'
import QuizTimer from '../components/student/QuizTimer.vue'
import QuestionDisplay from '../components/student/QuestionDisplay.vue'
import ResultsView from '../components/student/ResultsView.vue'
import BaseModal from '../components/common/BaseModal.vue'
import BaseButton from '../components/common/BaseButton.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import { formatTime } from '../utils/helpers'

export default {
  name: 'QuizView',
  components: {
    QuizTimer,
    QuestionDisplay,
    ResultsView,
    BaseModal,
    BaseButton,
    LoadingSpinner
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const quizStore = useQuizStore()
    const resultsStore = useResultsStore()

    const currentQuestionIndex = ref(0)
    const userAnswers = ref([])
    const visitedQuestions = ref([])
    const reviewQuestions = ref([])
    const isQuizActive = ref(true)
    const showResults = ref(false)
    const showSubmitModal = ref(false)
    const showPauseModal = ref(false)
    const showQuizInfo = ref(false)
    const timeRemaining = ref(0)
    const startTime = ref(null)
    const currentResult = ref(null)

    const quizId = parseInt(route.params.id)

    const currentQuiz = computed(() => quizStore.currentQuiz)
    const currentQuestion = computed(() => {
      return currentQuiz.value?.questions[currentQuestionIndex.value]
    })

    const progressPercentage = computed(() => {
      if (!currentQuiz.value) return 0
      return ((currentQuestionIndex.value + 1) / currentQuiz.value.questions.length) * 100
    })

    const answeredQuestions = computed(() => {
      return userAnswers.value.filter(answer => answer !== undefined).length
    })

    const completedQuestions = computed(() => {
      return userAnswers.value.filter(answer => answer !== undefined).length
    })

    const previousAttempts = computed(() => {
      return resultsStore.userResults.filter(result => result.quizId === quizId)
    })

    const loadProgress = () => {
      const progress = StorageService.getQuizProgress(quizId)
      if (progress) {
        userAnswers.value = progress.answers || []
        currentQuestionIndex.value = progress.currentQuestionIndex || 0
        visitedQuestions.value = progress.visitedQuestions || []
        reviewQuestions.value = progress.reviewQuestions || []
        timeRemaining.value = progress.timeRemaining || currentQuiz.value.duration
        isQuizActive.value = false // Start paused if loading progress
        showPauseModal.value = true
      } else {
        userAnswers.value = new Array(currentQuiz.value.questions.length).fill(undefined)
        visitedQuestions.value = [0] // Start with first question visited
        reviewQuestions.value = []
        timeRemaining.value = currentQuiz.value.duration
      }
      startTime.value = Date.now()
    }

    const saveProgress = () => {
      if (!currentQuiz.value) return

      const timeSpent = Math.floor((Date.now() - startTime.value) / 1000)
      const remainingTime = Math.max(0, currentQuiz.value.duration - timeSpent)

      StorageService.saveQuizProgress(quizId, {
        answers: userAnswers.value,
        currentQuestionIndex: currentQuestionIndex.value,
        visitedQuestions: visitedQuestions.value,
        reviewQuestions: reviewQuestions.value,
        timeRemaining: remainingTime,
        startTime: startTime.value
      })
    }

    const handleAnswerSelect = (answerIndex) => {
      userAnswers.value[currentQuestionIndex.value] = answerIndex
      markVisited(currentQuestionIndex.value)
      saveProgress()
    }

    const nextQuestion = () => {
      if (currentQuestionIndex.value < currentQuiz.value.questions.length - 1) {
        currentQuestionIndex.value++
        markVisited(currentQuestionIndex.value)
        saveProgress()
      }
    }

    const previousQuestion = () => {
      if (currentQuestionIndex.value > 0) {
        currentQuestionIndex.value--
        markVisited(currentQuestionIndex.value)
        saveProgress()
      }
    }

    const goToQuestion = (index) => {
      currentQuestionIndex.value = index
      markVisited(index)
      saveProgress()
    }

    const markVisited = (index) => {
      if (!visitedQuestions.value.includes(index)) {
        visitedQuestions.value.push(index)
      }
    }

    const markForReview = () => {
      const index = reviewQuestions.value.indexOf(currentQuestionIndex.value)
      if (index > -1) {
        reviewQuestions.value.splice(index, 1)
      } else {
        reviewQuestions.value.push(currentQuestionIndex.value)
      }
      saveProgress()
    }

    const pauseQuiz = () => {
      isQuizActive.value = false
      showPauseModal.value = true
      saveProgress()
    }

    const resumeQuiz = () => {
      isQuizActive.value = true
      showPauseModal.value = false
    }

    const saveAndExit = () => {
      saveProgress()
      router.push('/quizzes')
    }

    const submitQuiz = () => {
      showSubmitModal.value = true
    }

    const confirmSubmit = async () => {
      const timeSpent = Math.floor((Date.now() - startTime.value) / 1000)
      
      const result = await resultsStore.submitQuizResult(
        currentQuiz.value,
        userAnswers.value,
        timeSpent
      )
      
      if (result.success) {
        currentResult.value = result.result
        showResults.value = true
        showSubmitModal.value = false
        
        // Clear progress after successful submission
        StorageService.clearQuizProgress(quizId)
      }
    }

    const handleTimeUp = () => {
      isQuizActive.value = false
      submitQuiz()
    }

    const retryQuiz = () => {
      // Reset quiz state
      userAnswers.value = new Array(currentQuiz.value.questions.length).fill(undefined)
      currentQuestionIndex.value = 0
      visitedQuestions.value = [0]
      reviewQuestions.value = []
      showResults.value = false
      isQuizActive.value = true
      startTime.value = Date.now()
      timeRemaining.value = currentQuiz.value.duration
    }

    const backToQuizzes = () => {
      router.push('/quizzes')
    }

    const handleBeforeUnload = (event) => {
      if (isQuizActive.value && !showResults.value) {
        saveProgress()
        event.preventDefault()
        event.returnValue = 'Сіздің тест прогрессіңіз сақталады. Шығуға сенімдісіз бе?'
      }
    }

    onMounted(async () => {
      await quizStore.loadQuizById(quizId)
      if (quizStore.currentQuiz) {
        loadProgress()
        window.addEventListener('beforeunload', handleBeforeUnload)
      }
    })

    onUnmounted(() => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    })

    return {
      quizStore,
      resultsStore,
      currentQuiz,
      currentQuestion,
      currentQuestionIndex,
      currentResult,
      userAnswers,
      visitedQuestions,
      reviewQuestions,
      isQuizActive,
      showResults,
      showSubmitModal,
      showPauseModal,
      showQuizInfo,
      timeRemaining,
      progressPercentage,
      answeredQuestions,
      completedQuestions,
      previousAttempts,
      handleAnswerSelect,
      nextQuestion,
      previousQuestion,
      goToQuestion,
      markForReview,
      pauseQuiz,
      resumeQuiz,
      saveAndExit,
      submitQuiz,
      confirmSubmit,
      handleTimeUp,
      retryQuiz,
      backToQuizzes,
      formatTime
    }
  }
}
</script>

<style scoped>
.quiz-view {
  padding-bottom: var(--space-8);
  background: var(--gray-50);
  min-height: 100vh;
}

.quiz-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-6);
  margin-bottom: var(--space-6);
  padding: var(--space-6);
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  flex-wrap: wrap;
}

.quiz-info {
  flex: 1;
  min-width: 300px;
}

.quiz-title-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
  flex-wrap: wrap;
}

.quiz-title {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--gray-900);
  margin: 0;
  line-height: 1.2;
}

.quiz-actions {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.quiz-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--gray-100);
  border-radius: var(--radius);
  font-size: var(--text-sm);
}

.meta-icon {
  font-size: var(--text-lg);
}

.meta-text {
  font-weight: 500;
  color: var(--gray-700);
}

.quiz-description {
  padding: var(--space-4);
  background: var(--primary-50);
  border-radius: var(--radius);
  border: 1px solid var(--primary-200);
  margin-top: var(--space-4);
}

.quiz-description p {
  color: var(--primary-800);
  margin-bottom: var(--space-3);
  line-height: 1.5;
}

.quiz-instructions h4 {
  color: var(--primary-700);
  margin-bottom: var(--space-2);
  font-size: var(--text-sm);
}

.quiz-instructions ul {
  color: var(--primary-700);
  padding-left: var(--space-4);
  margin: 0;
}

.quiz-instructions li {
  margin-bottom: var(--space-1);
  font-size: var(--text-sm);
}

.quiz-timer {
  flex-shrink: 0;
}

.quiz-progress-section {
  margin-bottom: var(--space-6);
  padding: var(--space-4);
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
  font-weight: 500;
  color: var(--gray-700);
}

.progress-text {
  font-size: var(--text-sm);
}

.progress-percentage {
  font-size: var(--text-sm);
  color: var(--primary-600);
  font-weight: 600;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--gray-200);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary-500);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.question-section {
  margin-bottom: var(--space-6);
}

.results-section {
  margin-bottom: var(--space-6);
}

.question-navigation {
  background: white;
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  margin-bottom: var(--space-6);
}

.question-navigation h3 {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: var(--space-4);
}

.navigation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
  gap: var(--space-2);
}

.nav-button {
  position: relative;
  width: 50px;
  height: 50px;
  border: 2px solid var(--gray-300);
  border-radius: var(--radius);
  background: white;
  color: var(--gray-700);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-button:hover {
  border-color: var(--primary-500);
  color: var(--primary-500);
  transform: translateY(-1px);
}

.nav-button.answered {
  background: var(--primary-500);
  border-color: var(--primary-500);
  color: white;
}

.nav-button.current {
  border-color: var(--primary-700);
  background: var(--primary-100);
  color: var(--primary-700);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

.nav-button.visited {
  border-color: var(--primary-300);
}

.answer-status {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  background: var(--success-500);
  color: white;
  border-radius: 50%;
  font-size: var(--text-xs);
  display: flex;
  align-items: center;
  justify-content: center;
}

.quiz-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  margin-bottom: var(--space-6);
  flex-wrap: wrap;
}

.controls-left,
.controls-center,
.controls-right {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.controls-center {
  flex: 1;
  justify-content: center;
}

.control-button {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 120px;
}

.review-button {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.button-icon {
  font-size: var(--text-lg);
}

.review-panel {
  background: var(--warning-50);
  border: 1px solid var(--warning-200);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  margin-bottom: var(--space-6);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.review-header h4 {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--warning-700);
  margin: 0;
}

.review-count {
  background: var(--warning-500);
  color: white;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius);
  font-size: var(--text-sm);
  font-weight: 600;
}

.review-questions {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.review-question-btn {
  width: 40px;
  height: 40px;
  border: 2px solid var(--warning-400);
  border-radius: var(--radius);
  background: white;
  color: var(--warning-700);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
}

.review-question-btn:hover {
  background: var(--warning-100);
  transform: translateY(-1px);
}

.review-question-btn.current {
  background: var(--warning-500);
  border-color: var(--warning-500);
  color: white;
}

.loading-center {
  display: flex;
  justify-content: center;
  padding: var(--space-12);
}

.error-state {
  text-align: center;
  padding: var(--space-12);
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  max-width: 500px;
  margin: 0 auto;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: var(--space-4);
}

.error-state h3 {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: var(--space-2);
}

.error-state p {
  color: var(--gray-600);
  margin-bottom: var(--space-6);
  line-height: 1.5;
}

.error-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
  flex-wrap: wrap;
}

.submit-modal-content,
.pause-modal-content {
  text-align: center;
}

.warning-icon,
.pause-icon {
  font-size: 3rem;
  margin-bottom: var(--space-4);
}

.submit-modal-content p,
.pause-modal-content p {
  color: var(--gray-700);
  margin-bottom: var(--space-6);
  line-height: 1.6;
}

.quiz-summary {
  background: var(--gray-50);
  padding: var(--space-4);
  border-radius: var(--radius);
  margin-bottom: var(--space-6);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2) 0;
  color: var(--gray-700);
}

.summary-item:not(:last-child) {
  border-bottom: 1px solid var(--gray-200);
}

.pause-options {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
  flex-wrap: wrap;
}

.pause-option-btn {
  min-width: 120px;
}

@media (max-width: 768px) {
  .quiz-header {
    flex-direction: column;
    text-align: center;
  }
  
  .quiz-title-section {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .quiz-meta {
    grid-template-columns: 1fr;
  }
  
  .quiz-controls {
    flex-direction: column;
    gap: var(--space-3);
  }
  
  .controls-left,
  .controls-center,
  .controls-right {
    width: 100%;
    justify-content: center;
  }
  
  .control-button {
    width: 100%;
    justify-content: center;
  }
  
  .navigation-grid {
    grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  }
  
  .nav-button {
    width: 40px;
    height: 40px;
  }
  
  .error-actions {
    flex-direction: column;
  }
  
  .pause-options {
    flex-direction: column;
  }
  
  .pause-option-btn {
    width: 100%;
  }
}
</style>