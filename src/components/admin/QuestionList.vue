<template>
  <div class="question-list">
    <!-- Filters and Search -->
    <div class="list-controls">
      <div class="search-box">
        <div class="search-icon">🔍</div>
        <input
          v-model="filters.search"
          type="text"
          placeholder="Сұрақтарды іздеу..."
          class="search-input"
        />
        <button 
          v-if="filters.search" 
          @click="filters.search = ''" 
          class="clear-search"
          title="Тазарту"
        >
          &times;
        </button>
      </div>
      <div class="filter-controls">
        <select v-model="filters.category" class="filter-select">
          <option value="">Барлық санаттар</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
        <select v-model="filters.difficulty" class="filter-select">
          <option value="">Барлық қиындықтар</option>
          <option value="easy">Оңай</option>
          <option value="medium">Орташа</option>
          <option value="hard">Қиын</option>
        </select>
        <BaseButton 
          @click="clearFilters" 
          variant="outline" 
          size="small"
          :disabled="!hasActiveFilters"
        >
          Фильтрлерді тазарту
        </BaseButton>
      </div>
    </div>

    <!-- Statistics -->
    <div class="list-statistics" v-if="filteredQuestions.length > 0">
      <div class="stat-item">
        <span class="stat-value">{{ filteredQuestions.length }}</span>
        <span class="stat-label">Сұрақтар</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ uniqueCategories.length }}</span>
        <span class="stat-label">Санаттар</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ easyQuestions }}</span>
        <span class="stat-label">Оңай</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ mediumQuestions }}</span>
        <span class="stat-label">Орташа</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ hardQuestions }}</span>
        <span class="stat-label">Қиын</span>
      </div>
    </div>

    <LoadingSpinner v-if="questionStore.isLoading" class="loading-center" />

    <div v-else-if="filteredQuestions.length === 0" class="empty-state">
      <div class="empty-icon">❓</div>
      <h3>Сұрақтар табылмады</h3>
      <p v-if="hasActiveFilters">
        Сіздің фильтрлеріңізге сәйкес сұрақтар жоқ. Іздеу шарттарын өзгертіп көріңіз.
      </p>
      <p v-else>
        Сұрақтар әлі құрылған жоқ. Бірінші сұрақты құру арқылы бастаңыз!
      </p>
      <BaseButton 
        v-if="hasActiveFilters"
        @click="clearFilters" 
        variant="primary"
      >
        Фильтрлерді тазарту
      </BaseButton>
      <BaseButton 
        v-else
        @click="$emit('create-question')" 
        variant="primary"
      >
        Бірінші сұрақты құру
      </BaseButton>
    </div>

    <div v-else class="questions-container">
      <div class="questions-table">
        <div class="table-header">
          <div class="table-cell question-col">Сұрақ</div>
          <div class="table-cell category-col">Санат</div>
          <div class="table-cell difficulty-col">Қиындық</div>
          <div class="table-cell options-col">Нұсқалар</div>
          <div class="table-cell actions-col">Әрекеттер</div>
        </div>

        <div
          v-for="question in filteredQuestions"
          :key="question.id"
          class="table-row"
        >
          <div class="table-cell question-col">
            <div class="question-text" :title="question.question">
              {{ truncateText(question.question, 80) }}
            </div>
            <div class="question-meta">
              <span class="meta-item">ID: {{ question.id }}</span>
              <span class="meta-item" v-if="question.explanation">Түсіндірмесі бар</span>
            </div>
          </div>
          <div class="table-cell category-col">
            <span class="category-badge">{{ question.category }}</span>
          </div>
          <div class="table-cell difficulty-col">
            <span class="difficulty-badge" :style="{ backgroundColor: getDifficultyColor(question.difficulty) }">
              {{ getDifficultyText(question.difficulty) }}
            </span>
          </div>
          <div class="table-cell options-col">
            <div class="options-info">
              <span class="options-count">{{ question.options.length }} нұсқа</span>
              <div class="correct-answer">
                Дұрыс: {{ String.fromCharCode(65 + question.correctAnswer) }}
              </div>
            </div>
          </div>
          <div class="table-cell actions-col">
            <div class="actions">
              <BaseButton
                @click="$emit('edit-question', question)"
                variant="outline"
                size="small"
                title="Өңдеу"
              >
                <span class="button-icon">✏️</span>
                Өңдеу
              </BaseButton>
              <BaseButton
                @click="deleteQuestion(question.id)"
                variant="danger"
                size="small"
                :isLoading="deletingQuestionId === question.id"
                title="Жою"
              >
                <span class="button-icon">🗑️</span>
                Жою
              </BaseButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination" v-if="totalPages > 1">
        <button 
          @click="currentPage--" 
          :disabled="currentPage === 1"
          class="pagination-btn"
        >
          ←
        </button>
        
        <span class="pagination-info">
          Бет {{ currentPage }} / {{ totalPages }}
        </span>
        
        <button 
          @click="currentPage++" 
          :disabled="currentPage === totalPages"
          class="pagination-btn"
        >
          →
        </button>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <BaseModal
      v-model:isOpen="showDeleteModal"
      title="Сұрақты жою"
      size="small"
    >
      <div class="delete-modal-content">
        <div class="warning-icon">⚠️</div>
        <h4>Сұрақты жоюға сенімдісіз бе?</h4>
        <p>Бұл әрекетті кері қайтару мүмкін емес. Осы сұрақты пайдаланатын барлық тесттер одан әрі жұмыс істемейді.</p>
        
        <div class="question-preview" v-if="questionToDelete">
          <strong>Сұрақ:</strong> {{ truncateText(questionToDelete.question, 100) }}
        </div>
        
        <template #footer>
          <BaseButton @click="showDeleteModal = false" variant="outline">
            Болдырмау
          </BaseButton>
          <BaseButton 
            @click="confirmDelete" 
            variant="danger" 
            :isLoading="questionStore.isLoading"
          >
            Ия, жою
          </BaseButton>
        </template>
      </div>
    </BaseModal>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useQuestionStore } from '../../stores/questions'
import { getDifficultyColor, getDifficultyText } from '../../utils/helpers'
import BaseButton from '../common/BaseButton.vue'
import BaseModal from '../common/BaseModal.vue'
import LoadingSpinner from '../common/LoadingSpinner.vue'

export default {
  name: 'QuestionList',
  components: {
    BaseButton,
    BaseModal,
    LoadingSpinner
  },
  emits: ['edit-question', 'create-question'],
  setup(props, { emit }) {
    const questionStore = useQuestionStore()
    const showDeleteModal = ref(false)
    const deletingQuestionId = ref(null)
    const questionToDelete = ref(null)
    const currentPage = ref(1)
    const pageSize = 10

    const filters = reactive({
      search: '',
      category: '',
      difficulty: ''
    })

    const categories = computed(() => questionStore.categories)

    const filteredQuestions = computed(() => {
      let questions = questionStore.questions

      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        questions = questions.filter(q =>
          q.question.toLowerCase().includes(searchLower) ||
          q.explanation?.toLowerCase().includes(searchLower) ||
          q.category.toLowerCase().includes(searchLower)
        )
      }

      if (filters.category) {
        questions = questions.filter(q => q.category === filters.category)
      }

      if (filters.difficulty) {
        questions = questions.filter(q => q.difficulty === filters.difficulty)
      }

      return questions
    })

    const paginatedQuestions = computed(() => {
      const startIndex = (currentPage.value - 1) * pageSize
      return filteredQuestions.value.slice(startIndex, startIndex + pageSize)
    })

    const totalPages = computed(() => {
      return Math.ceil(filteredQuestions.value.length / pageSize)
    })

    const hasActiveFilters = computed(() => {
      return filters.search || filters.category || filters.difficulty
    })

    const uniqueCategories = computed(() => {
      return [...new Set(filteredQuestions.value.map(q => q.category))]
    })

    const easyQuestions = computed(() => {
      return filteredQuestions.value.filter(q => q.difficulty === 'easy').length
    })

    const mediumQuestions = computed(() => {
      return filteredQuestions.value.filter(q => q.difficulty === 'medium').length
    })

    const hardQuestions = computed(() => {
      return filteredQuestions.value.filter(q => q.difficulty === 'hard').length
    })

    const truncateText = (text, length) => {
      if (!text) return ''
      return text.length > length ? text.substring(0, length) + '...' : text
    }

    const deleteQuestion = (questionId) => {
      const question = questionStore.questions.find(q => q.id === questionId)
      questionToDelete.value = question
      deletingQuestionId.value = questionId
      showDeleteModal.value = true
    }

    const confirmDelete = async () => {
      if (!questionToDelete.value) return

      const result = await questionStore.deleteQuestion(questionToDelete.value.id)
      
      if (result.success) {
        showDeleteModal.value = false
        questionToDelete.value = null
        deletingQuestionId.value = null
      }
    }

    const clearFilters = () => {
      filters.search = ''
      filters.category = ''
      filters.difficulty = ''
      currentPage.value = 1
    }

    // Reset to page 1 when filters change
    watch(() => filters, () => {
      currentPage.value = 1
    }, { deep: true })

    onMounted(async () => {
      await questionStore.loadQuestions()
    })

    return {
      questionStore,
      showDeleteModal,
      deletingQuestionId,
      questionToDelete,
      currentPage,
      filters,
      categories,
      filteredQuestions: paginatedQuestions,
      totalPages,
      hasActiveFilters,
      uniqueCategories,
      easyQuestions,
      mediumQuestions,
      hardQuestions,
      getDifficultyColor,
      getDifficultyText,
      truncateText,
      deleteQuestion,
      confirmDelete,
      clearFilters
    }
  }
}
</script>

<style scoped>
.question-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.list-controls {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: var(--space-4);
  flex-wrap: wrap;
  padding: var(--space-4);
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
}

.search-box {
  flex: 1;
  min-width: 300px;
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
  padding: var(--space-3) var(--space-3) var(--space-3) var(--space-10);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius);
  font-size: var(--text-base);
  transition: var(--transition);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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

.clear-search:hover {
  color: var(--gray-600);
}

.filter-controls {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
  align-items: center;
}

.filter-select {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius);
  background: white;
  font-size: var(--text-sm);
  min-width: 120px;
}

.list-statistics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--space-4);
  padding: var(--space-4);
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
}

.stat-item {
  text-align: center;
  padding: var(--space-3);
  background: var(--gray-50);
  border-radius: var(--radius);
  border: 1px solid var(--gray-200);
}

.stat-value {
  display: block;
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--primary-600);
  margin-bottom: var(--space-1);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--gray-600);
  font-weight: 500;
}

.loading-center {
  display: flex;
  justify-content: center;
  padding: var(--space-12);
}

.empty-state {
  text-align: center;
  padding: var(--space-12);
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--space-4);
}

.empty-state h3 {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: var(--space-2);
}

.empty-state p {
  color: var(--gray-600);
  margin-bottom: var(--space-6);
  line-height: 1.5;
}

.questions-container {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.questions-table {
  width: 100%;
}

.table-header {
  display: grid;
  grid-template-columns: 3fr 1fr 1fr 1fr 1fr;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--gray-50);
  border-bottom: 1px solid var(--gray-200);
  font-weight: 600;
  color: var(--gray-700);
  font-size: var(--text-sm);
}

.table-row {
  display: grid;
  grid-template-columns: 3fr 1fr 1fr 1fr 1fr;
  gap: var(--space-4);
  padding: var(--space-4);
  border-bottom: 1px solid var(--gray-200);
  transition: var(--transition);
  align-items: center;
}

.table-row:hover {
  background: var(--gray-50);
}

.table-row:last-child {
  border-bottom: none;
}

.table-cell {
  display: flex;
  align-items: center;
  min-height: 40px;
}

.question-col {
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-2);
}

.question-text {
  font-weight: 500;
  color: var(--gray-700);
  line-height: 1.4;
}

.question-meta {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.meta-item {
  font-size: var(--text-xs);
  color: var(--gray-500);
  background: var(--gray-100);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius);
}

.category-badge {
  padding: var(--space-1) var(--space-2);
  background: var(--primary-500);
  color: white;
  border-radius: var(--radius);
  font-size: var(--text-xs);
  font-weight: 600;
}

.difficulty-badge {
  padding: var(--space-1) var(--space-2);
  color: white;
  border-radius: var(--radius);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: capitalize;
}

.options-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.options-count {
  font-size: var(--text-sm);
  color: var(--gray-600);
}

.correct-answer {
  font-size: var(--text-xs);
  color: var(--success-600);
  font-weight: 600;
  background: var(--success-100);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius);
}

.actions {
  display: flex;
  gap: var(--space-2);
  justify-content: flex-end;
}

.button-icon {
  font-size: var(--text-sm);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  border-top: 1px solid var(--gray-200);
}

.pagination-btn {
  background: var(--gray-100);
  border: 1px solid var(--gray-300);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius);
  cursor: pointer;
  transition: var(--transition);
  font-weight: 600;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--gray-200);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  color: var(--gray-600);
  font-weight: 500;
}

.delete-modal-content {
  text-align: center;
}

.warning-icon {
  font-size: 3rem;
  margin-bottom: var(--space-4);
}

.delete-modal-content h4 {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: var(--space-3);
}

.delete-modal-content p {
  color: var(--gray-700);
  margin-bottom: var(--space-6);
  line-height: 1.6;
}

.question-preview {
  background: var(--gray-50);
  padding: var(--space-3);
  border-radius: var(--radius);
  border: 1px solid var(--gray-200);
  margin-bottom: var(--space-6);
  text-align: left;
  font-size: var(--text-sm);
}

@media (max-width: 1024px) {
  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: var(--space-2);
  }
  
  .table-cell {
    justify-content: space-between;
    border-bottom: 1px solid var(--gray-200);
    padding: var(--space-2) 0;
  }
  
  .table-cell:last-child {
    border-bottom: none;
  }
  
  .table-cell::before {
    content: attr(data-label);
    font-weight: 600;
    color: var(--gray-700);
    margin-right: var(--space-2);
  }
  
  .table-header {
    display: none;
  }
  
  .table-row {
    padding: var(--space-4);
    margin-bottom: var(--space-4);
    border: 1px solid var(--gray-200);
    border-radius: var(--radius);
  }
  
  .actions {
    justify-content: center;
    margin-top: var(--space-3);
  }
}

@media (max-width: 768px) {
  .list-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    min-width: auto;
  }
  
  .filter-controls {
    justify-content: space-between;
  }
  
  .filter-select {
    flex: 1;
  }
  
  .list-statistics {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>