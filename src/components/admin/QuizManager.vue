<template>
  <div class="quiz-manager">
    <form @submit.prevent="handleSubmit" class="quiz-form">
      <!-- Quiz Information -->
      <div class="form-section">
        <h3>Тест ақпараты</h3>
        
        <div class="form-group">
          <label for="quiz-title" class="form-label">Тест атауы *</label>
          <input
            id="quiz-title"
            v-model="form.title"
            type="text"
            class="form-input"
            :class="{ error: errors.title }"
            placeholder="Тест атауын енгізіңіз..."
            required
          />
          <div v-if="errors.title" class="error-message">{{ errors.title }}</div>
        </div>

        <div class="form-group">
          <label for="quiz-description" class="form-label">Сипаттама</label>
          <textarea
            id="quiz-description"
            v-model="form.description"
            class="form-textarea"
            placeholder="Бұл тест туралы сипаттама жазыңыз..."
            rows="3"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="quiz-category" class="form-label">Санат *</label>
            <select
              id="quiz-category"
              v-model="form.category"
              class="form-select"
              :class="{ error: errors.category }"
              required
            >
              <option value="">Санатты таңдаңыз</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
            <div v-if="errors.category" class="error-message">{{ errors.category }}</div>
          </div>

          <div class="form-group">
            <label for="quiz-duration" class="form-label">Уақыт (секунд) *</label>
            <input
              id="quiz-duration"
              v-model.number="form.duration"
              type="number"
              class="form-input"
              :class="{ error: errors.duration }"
              min="60"
              max="7200"
              required
            />
            <div v-if="errors.duration" class="error-message">{{ errors.duration }}</div>
            <div class="duration-hint">
              {{ formatTime(form.duration) }} - 
              <span v-if="form.duration < 300">Өте қысқа</span>
              <span v-else-if="form.duration < 900">Қысқа</span>
              <span v-else-if="form.duration < 1800">Орташа</span>
              <span v-else>Ұзақ</span>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.isActive" />
            <span class="checkmark"></span>
            Тест белсенді
          </label>
          <div class="checkbox-hint">
            Белсенді тест студенттерге көрінеді
          </div>
        </div>
      </div>

      <!-- Question Selection -->
      <div class="form-section">
        <h3>Сұрақтарды таңдау</h3>
        
        <div class="questions-selection">
          <!-- Selection Controls -->
          <div class="selection-controls">
            <div class="search-box">
              <div class="search-icon">🔍</div>
              <input
                v-model="questionSearch"
                type="text"
                placeholder="Сұрақтарды іздеу..."
                class="search-input"
              />
              <button 
                v-if="questionSearch" 
                @click="questionSearch = ''" 
                class="clear-search"
              >
                &times;
              </button>
            </div>
            <div class="filter-controls">
              <select v-model="questionCategory" class="filter-select">
                <option value="">Барлық санаттар</option>
                <option v-for="cat in questionCategories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
              <select v-model="questionDifficulty" class="filter-select">
                <option value="">Барлық қиындықтар</option>
                <option value="easy">Оңай</option>
                <option value="medium">Орташа</option>
                <option value="hard">Қиын</option>
              </select>
            </div>
          </div>

          <LoadingSpinner v-if="questionStore.isLoading" class="loading-center" />

          <!-- Questions Grid -->
          <div v-else class="questions-grid">
            <div
              v-for="question in filteredQuestions"
              :key="question.id"
              @click="toggleQuestion(question.id)"
              :class="[
                'question-card',
                { selected: form.questions.includes(question.id) }
              ]"
            >
              <div class="question-content">
                <h4 class="question-text">{{ question.question }}</h4>
                <div class="question-meta">
                  <span class="meta-badge category">{{ question.category }}</span>
                  <span class="meta-badge" :style="{ backgroundColor: getDifficultyColor(question.difficulty) }">
                    {{ getDifficultyText(question.difficulty) }}
                  </span>
                  <span class="meta-badge options">{{ question.options.length }} нұсқа</span>
                </div>
                <div class="correct-answer">
                  Дұрыс жауап: {{ String.fromCharCode(65 + question.correctAnswer) }}
                </div>
              </div>
              <div class="selection-indicator">
                <div class="checkmark" v-if="form.questions.includes(question.id)">✓</div>
              </div>
            </div>
          </div>

          <div v-if="!questionStore.isLoading && filteredQuestions.length === 0" class="empty-state">
            <div class="empty-icon">❓</div>
            <p>Сұрақтар табылмады. Алдымен бірнеше сұрақ құрыңыз!</p>
            <BaseButton @click="$router.push('/admin?tab=questions')" variant="primary">
              Сұрақтарды басқару
            </BaseButton>
          </div>
        </div>

        <!-- Selected Questions Summary -->
        <div class="selected-questions">
          <div class="selected-header">
            <h4>Таңдалған сұрақтар ({{ form.questions.length }})</h4>
            <div class="selection-stats">
              <span class="stat">Оңай: {{ selectedEasy }}</span>
              <span class="stat">Орташа: {{ selectedMedium }}</span>
              <span class="stat">Қиын: {{ selectedHard }}</span>
            </div>
          </div>
          
          <div v-if="form.questions.length === 0" class="no-selection">
            <div class="no-selection-icon">📝</div>
            <p>Әлі ешбір сұрақ таңдалған жоқ</p>
          </div>
          
          <div v-else class="selected-list">
            <div
              v-for="questionId in form.questions"
              :key="questionId"
              class="selected-item"
            >
              <div class="item-content">
                <span class="question-preview">{{ getQuestionText(questionId) }}</span>
                <div class="item-meta">
                  <span class="meta">{{ getQuestionCategory(questionId) }}</span>
                  <span class="meta">{{ getDifficultyText(getQuestionDifficulty(questionId)) }}</span>
                </div>
              </div>
              <button
                type="button"
                @click="removeQuestion(questionId)"
                class="remove-btn"
                title="Жою"
              >
                &times;
              </button>
            </div>
          </div>

          <div class="selection-actions" v-if="form.questions.length > 0">
            <BaseButton
              type="button"
              @click="shuffleQuestions"
              variant="outline"
              size="small"
            >
              🎲 Сұрақтарды араластыру
            </BaseButton>
            <BaseButton
              type="button"
              @click="clearSelection"
              variant="outline"
              size="small"
            >
              🗑️ Барлығын жою
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Quiz Preview -->
      <div class="form-section preview-section" v-if="showPreview">
        <h3>Тест алдын ала қарауы</h3>
        <div class="preview-content">
          <div class="preview-header">
            <h4>{{ form.title || '[Тест атауы]' }}</h4>
            <p class="preview-description">{{ form.description || '[Сипаттама]' }}</p>
            <div class="preview-meta">
              <span>Санат: {{ form.category || '[Санат]' }}</span>
              <span>Уақыт: {{ formatTime(form.duration) }}</span>
              <span>Сұрақтар: {{ form.questions.length }}</span>
              <span>Статус: {{ form.isActive ? 'Белсенді' : 'Белсенді емес' }}</span>
            </div>
          </div>
          
          <div class="preview-questions">
            <h5>Сұрақтар тізімі:</h5>
            <div class="questions-preview">
              <div
                v-for="(questionId, index) in form.questions"
                :key="questionId"
                class="preview-question-item"
              >
                <span class="question-number">{{ index + 1 }}.</span>
                <span class="question-text">{{ getQuestionText(questionId) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <BaseButton
          type="button"
          @click="$emit('cancel')"
          variant="outline"
        >
          Болдырмау
        </BaseButton>
        <BaseButton
          type="submit"
          variant="primary"
          :isLoading="quizStore.isLoading"
          :disabled="form.questions.length === 0"
        >
          {{ editingQuiz ? 'Тестті жаңарту' : 'Тест құру' }}
        </BaseButton>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '../../stores/quizzes'
import { useQuestionStore } from '../../stores/questions'
import { QUIZ_CATEGORIES } from '../../utils/constants'
import { getDifficultyColor, getDifficultyText, formatTime } from '../../utils/helpers'
import BaseButton from '../common/BaseButton.vue'
import LoadingSpinner from '../common/LoadingSpinner.vue'

export default {
  name: 'QuizManager',
  components: {
    BaseButton,
    LoadingSpinner
  },
  emits: ['quiz-created', 'cancel'],
  setup(props, { emit }) {
    const router = useRouter()
    const quizStore = useQuizStore()
    const questionStore = useQuestionStore()

    const form = reactive({
      title: '',
      description: '',
      category: '',
      duration: 1800, // 30 minutes default
      questions: [],
      isActive: true
    })

    const errors = reactive({})
    const questionSearch = ref('')
    const questionCategory = ref('')
    const questionDifficulty = ref('')
    const showPreview = ref(false)
    const editingQuiz = false // For future extension

    const categories = QUIZ_CATEGORIES

    const questionCategories = computed(() => questionStore.categories)

    const filteredQuestions = computed(() => {
      let questions = questionStore.questions

      if (questionSearch.value) {
        const searchLower = questionSearch.value.toLowerCase()
        questions = questions.filter(q =>
          q.question.toLowerCase().includes(searchLower) ||
          q.category.toLowerCase().includes(searchLower)
        )
      }

      if (questionCategory.value) {
        questions = questions.filter(q => q.category === questionCategory.value)
      }

      if (questionDifficulty.value) {
        questions = questions.filter(q => q.difficulty === questionDifficulty.value)
      }

      return questions
    })

    const selectedEasy = computed(() => {
      return form.questions.filter(id => {
        const question = questionStore.questions.find(q => q.id === id)
        return question?.difficulty === 'easy'
      }).length
    })

    const selectedMedium = computed(() => {
      return form.questions.filter(id => {
        const question = questionStore.questions.find(q => q.id === id)
        return question?.difficulty === 'medium'
      }).length
    })

    const selectedHard = computed(() => {
      return form.questions.filter(id => {
        const question = questionStore.questions.find(q => q.id === id)
        return question?.difficulty === 'hard'
      }).length
    })

    const validateForm = () => {
      const newErrors = {}

      if (!form.title.trim()) {
        newErrors.title = 'Тест атауы міндетті'
      }

      if (!form.category) {
        newErrors.category = 'Санат міндетті'
      }

      if (!form.duration || form.duration < 60) {
        newErrors.duration = 'Уақыт кемінде 60 секунд болуы керек'
      } else if (form.duration > 7200) {
        newErrors.duration = 'Уақыт 7200 секундтан аспауы керек'
      }

      if (form.questions.length === 0) {
        newErrors.questions = 'Кемінде бір сұрақ таңдау керек'
      }

      Object.assign(errors, newErrors)
      return Object.keys(newErrors).length === 0
    }

    const toggleQuestion = (questionId) => {
      const index = form.questions.indexOf(questionId)
      if (index > -1) {
        form.questions.splice(index, 1)
      } else {
        form.questions.push(questionId)
      }
    }

    const removeQuestion = (questionId) => {
      const index = form.questions.indexOf(questionId)
      if (index > -1) {
        form.questions.splice(index, 1)
      }
    }

    const clearSelection = () => {
      form.questions = []
    }

    const shuffleQuestions = () => {
      // Fisher-Yates shuffle algorithm
      for (let i = form.questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [form.questions[i], form.questions[j]] = [form.questions[j], form.questions[i]]
      }
    }

    const getQuestionText = (questionId) => {
      const question = questionStore.questions.find(q => q.id === questionId)
      return question ? question.question : 'Белгісіз сұрақ'
    }

    const getQuestionCategory = (questionId) => {
      const question = questionStore.questions.find(q => q.id === questionId)
      return question ? question.category : 'Белгісіз'
    }

    const getQuestionDifficulty = (questionId) => {
      const question = questionStore.questions.find(q => q.id === questionId)
      return question ? question.difficulty : 'easy'
    }

    const handleSubmit = async () => {
      if (!validateForm()) return

      try {
        const result = await quizStore.createQuiz(form)
        
        if (result.success) {
          // Reset form
          Object.assign(form, {
            title: '',
            description: '',
            category: '',
            duration: 1800,
            questions: [],
            isActive: true
          })
          
          emit('quiz-created')
        }
      } catch (error) {
        console.error('Тест құру қатесі:', error)
      }
    }

    // Auto-show preview when form has content
    watch(() => form, (newForm) => {
      if (newForm.title || newForm.questions.length > 0) {
        showPreview.value = true
      }
    }, { deep: true })

    onMounted(async () => {
      await questionStore.loadQuestions()
    })

    return {
      form,
      errors,
      questionSearch,
      questionCategory,
      questionDifficulty,
      showPreview,
      categories,
      questionCategories,
      filteredQuestions,
      selectedEasy,
      selectedMedium,
      selectedHard,
      editingQuiz,
      quizStore,
      questionStore,
      getDifficultyColor,
      getDifficultyText,
      formatTime,
      toggleQuestion,
      removeQuestion,
      clearSelection,
      shuffleQuestions,
      getQuestionText,
      getQuestionCategory,
      getQuestionDifficulty,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.quiz-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.form-section {
  padding: var(--space-6);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  background: var(--gray-50);
}

.form-section h3 {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.form-section h3::before {
  content: '';
  width: 4px;
  height: 20px;
  background: var(--primary-500);
  border-radius: 2px;
}

.form-group {
  margin-bottom: var(--space-4);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.form-label {
  display: block;
  margin-bottom: var(--space-2);
  font-weight: 500;
  color: var(--gray-700);
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius);
  font-size: var(--text-base);
  transition: var(--transition);
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.error {
  border-color: var(--error-500);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.duration-hint {
  color: var(--gray-500);
  font-size: var(--text-sm);
  margin-top: var(--space-1);
}

.error-message {
  color: var(--error-500);
  font-size: var(--text-sm);
  margin-top: var(--space-1);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  color: var(--gray-700);
}

.checkbox-label input {
  display: none;
}

.checkmark {
  width: 16px;
  height: 16px;
  border: 2px solid var(--gray-300);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.checkbox-label input:checked + .checkmark {
  background: var(--primary-500);
  border-color: var(--primary-500);
}

.checkbox-label input:checked + .checkmark::after {
  content: '✓';
  color: white;
  font-size: var(--text-xs);
  font-weight: bold;
}

.checkbox-hint {
  color: var(--gray-500);
  font-size: var(--text-sm);
  margin-top: var(--space-1);
  margin-left: var(--space-6);
}

.questions-selection {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.selection-controls {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 250px;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: var(--space-3);
  color: var(--gray-400);
  font-size: var(--text-lg);
}

.search-input {
  width: 100%;
  padding: var(--space-2) var(--space-3) var(--space-2) var(--space-10);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius);
  font-size: var(--text-sm);
}

.clear-search {
  position: absolute;
  right: var(--space-3);
  background: none;
  border: none;
  color: var(--gray-400);
  cursor: pointer;
  font-size: var(--text-lg);
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.filter-controls {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.filter-select {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius);
  background: white;
  font-size: var(--text-sm);
  min-width: 120px;
}

.loading-center {
  display: flex;
  justify-content: center;
  padding: var(--space-8);
}

.questions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-3);
  max-height: 400px;
  overflow-y: auto;
  padding: var(--space-2);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius);
  background: white;
}

.question-card {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3);
  border: 2px solid var(--gray-200);
  border-radius: var(--radius);
  cursor: pointer;
  transition: var(--transition);
  background: white;
}

.question-card:hover {
  border-color: var(--primary-300);
  transform: translateY(-1px);
}

.question-card.selected {
  border-color: var(--primary-500);
  background: var(--primary-50);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}

.question-content {
  flex: 1;
}

.question-text {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--gray-700);
  margin-bottom: var(--space-2);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.question-meta {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-bottom: var(--space-1);
}

.meta-badge {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius);
  font-size: var(--text-xs);
  font-weight: 600;
  color: white;
}

.meta-badge.category {
  background: var(--gray-500);
}

.meta-badge.options {
  background: var(--primary-500);
}

.correct-answer {
  font-size: var(--text-xs);
  color: var(--success-600);
  font-weight: 600;
}

.selection-indicator {
  flex-shrink: 0;
}

.checkmark {
  width: 20px;
  height: 20px;
  background: var(--primary-500);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-sm);
  font-weight: bold;
}

.empty-state {
  text-align: center;
  padding: var(--space-8);
  color: var(--gray-500);
  border: 2px dashed var(--gray-300);
  border-radius: var(--radius);
  background: white;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: var(--space-3);
}

.selected-questions {
  margin-top: var(--space-4);
  padding: var(--space-4);
  background: white;
  border-radius: var(--radius);
  border: 1px solid var(--gray-200);
}

.selected-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
  flex-wrap: wrap;
  gap: var(--space-2);
}

.selected-header h4 {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--gray-900);
  margin: 0;
}

.selection-stats {
  display: flex;
  gap: var(--space-3);
  font-size: var(--text-sm);
  color: var(--gray-600);
}

.stat {
  padding: var(--space-1) var(--space-2);
  background: var(--gray-100);
  border-radius: var(--radius);
}

.no-selection {
  text-align: center;
  padding: var(--space-6);
  color: var(--gray-500);
}

.no-selection-icon {
  font-size: 2rem;
  margin-bottom: var(--space-2);
}

.selected-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  max-height: 200px;
  overflow-y: auto;
}

.selected-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2) var(--space-3);
  background: var(--gray-50);
  border-radius: var(--radius);
  border: 1px solid var(--gray-200);
  transition: var(--transition);
}

.selected-item:hover {
  background: var(--gray-100);
}

.item-content {
  flex: 1;
}

.question-preview {
  display: block;
  font-weight: 500;
  color: var(--gray-700);
  margin-bottom: var(--space-1);
  font-size: var(--text-sm);
}

.item-meta {
  display: flex;
  gap: var(--space-3);
  font-size: var(--text-xs);
  color: var(--gray-500);
}

.remove-btn {
  background: var(--error-500);
  color: white;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-sm);
  transition: var(--transition);
  flex-shrink: 0;
}

.remove-btn:hover {
  background: var(--error-600);
  transform: scale(1.1);
}

.selection-actions {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--gray-200);
}

.preview-section {
  background: var(--primary-50);
  border-color: var(--primary-200);
}

.preview-content {
  background: white;
  padding: var(--space-4);
  border-radius: var(--radius);
  border: 1px solid var(--primary-200);
}

.preview-header h4 {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: var(--space-2);
}

.preview-description {
  color: var(--gray-600);
  margin-bottom: var(--space-3);
  line-height: 1.5;
}

.preview-meta {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
  font-size: var(--text-sm);
  color: var(--gray-600);
}

.preview-meta span {
  background: var(--gray-100);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius);
}

.preview-questions {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--gray-200);
}

.preview-questions h5 {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: var(--space-2);
}

.questions-preview {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  max-height: 200px;
  overflow-y: auto;
}

.preview-question-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  padding: var(--space-2);
  background: var(--gray-50);
  border-radius: var(--radius);
  border: 1px solid var(--gray-200);
}

.question-number {
  font-weight: 600;
  color: var(--primary-600);
  flex-shrink: 0;
}

.question-text {
  font-size: var(--text-sm);
  color: var(--gray-700);
  line-height: 1.4;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding-top: var(--space-4);
  border-top: 1px solid var(--gray-200);
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .selection-controls {
    flex-direction: column;
  }
  
  .questions-grid {
    grid-template-columns: 1fr;
  }
  
  .selected-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .selection-stats {
    width: 100%;
    justify-content: space-between;
  }
  
  .preview-meta {
    flex-direction: column;
    gap: var(--space-2);
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>