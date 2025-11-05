<template>
  <div class="quiz-list-view">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">Қолжетімді тесттер</h1>
        <p class="page-subtitle">Экономика пәні бойынша біліміңізді сынайтын тесттер жинағы</p>
      </div>

      <!-- Statistics Banner -->
      <div class="stats-banner" v-if="authStore.isStudent && userStats">
        <div class="stats-content">
          <div class="stat">
            <div class="stat-value">{{ userStats.totalAttempts }}</div>
            <div class="stat-label">Жалпы өтулер</div>
          </div>
          <div class="stat">
            <div class="stat-value">{{ userStats.averageScore }}%</div>
            <div class="stat-label">Орташа нәтиже</div>
          </div>
          <div class="stat">
            <div class="stat-value">{{ userStats.bestScore }}%</div>
            <div class="stat-label">Ең үздік нәтиже</div>
          </div>
          <div class="stat">
            <div class="stat-value">{{ userStats.completedQuizzes }}</div>
            <div class="stat-label">Аяқталған тесттер</div>
          </div>
        </div>
        <div class="stats-motivation">
          <div class="motivation-icon">💪</div>
          <div class="motivation-text">
            <strong>Жалғастырыңыз!</strong> Әрбір тест сіздің біліміңізді нығайтады.
          </div>
        </div>
      </div>

      <!-- Filters and Search -->
      <div class="filters-section" v-if="filteredQuizzes.length > 0 || hasActiveFilters">
        <div class="filters">
          <div class="filter-group">
            <label for="category-filter" class="filter-label">Санат</label>
            <select id="category-filter" v-model="filters.category" class="filter-select">
              <option value="">Барлық санаттар</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>
          <div class="filter-group">
            <label for="difficulty-filter" class="filter-label">Қиындық</label>
            <select id="difficulty-filter" v-model="filters.difficulty" class="filter-select">
              <option value="">Барлық деңгейлер</option>
              <option value="easy">Оңай</option>
              <option value="medium">Орташа</option>
              <option value="hard">Қиын</option>
            </select>
          </div>
          <div class="filter-group">
            <label for="status-filter" class="filter-label">Статус</label>
            <select id="status-filter" v-model="filters.status" class="filter-select">
              <option value="all">Барлығы</option>
              <option value="completed">Аяқталған</option>
              <option value="in-progress">Жалғасуда</option>
              <option value="not-started">Басталмаған</option>
            </select>
          </div>
        </div>
        <div class="search-controls">
          <div class="search-box">
            <div class="search-icon">🔍</div>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Тесттерді іздеу..."
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
          <BaseButton 
            @click="clearFilters" 
            variant="outline" 
            :disabled="!hasActiveFilters"
            class="clear-filters-btn"
          >
            Фильтрлерді тазарту
          </BaseButton>
        </div>
      </div>

      <LoadingSpinner v-if="quizStore.isLoading" class="loading-center" />

      <div v-else-if="filteredQuizzes.length === 0" class="empty-state">
        <div class="empty-icon">📚</div>
        <h3>Тесттер табылмады</h3>
        <p v-if="hasActiveFilters">
          Сіздің фильтрлеріңізге сәйкес тесттер жоқ. Іздеу шарттарын өзгертіп көріңіз.
        </p>
        <p v-else>
            Қазіргі уақытта қолжетімді тесттер жоқ.
        </p>
        <div class="empty-actions">
          <BaseButton 
            v-if="hasActiveFilters"
            @click="clearFilters" 
            variant="primary"
          >
            Фильтрлерді тазарту
          </BaseButton>
          <BaseButton 
            v-if="authStore.isAdmin"
            @click="showCreateModal = true" 
            variant="primary"
          >
            Бірінші тестті құру
          </BaseButton>
        </div>
      </div>

      <div v-else class="quizzes-container">
        <!-- Active Quizzes -->
        <div class="quizzes-section" v-if="activeQuizzes.length > 0">
          <h2 class="section-title">Белсенді тесттер</h2>
          <div class="quizzes-grid">
            <QuizCard
              v-for="quiz in activeQuizzes"
              :key="quiz.id"
              :quiz="quiz"
              @start-quiz="startQuiz"
            />
          </div>
        </div>

        <!-- Inactive Quizzes (Admin only) -->
        <div class="quizzes-section" v-if="authStore.isAdmin && inactiveQuizzes.length > 0">
          <h2 class="section-title">Белсенді емес тесттер</h2>
          <div class="admin-notice">
            <div class="notice-icon">👁️</div>
            <div class="notice-content">
              <strong>Тек әкімшілерге көрінеді:</strong> Бұл тесттер студенттерге көрінбейді
            </div>
          </div>
          <div class="quizzes-grid">
            <QuizCard
              v-for="quiz in inactiveQuizzes"
              :key="quiz.id"
              :quiz="quiz"
              @start-quiz="startQuiz"
            />
          </div>
        </div>

        <!-- Recommended Section -->
        <div class="recommended-section" v-if="recommendedQuizzes.length > 0 && authStore.isStudent">
          <h2 class="section-title">Ұсынылатын тесттер</h2>
          <p class="section-subtitle">Сіздің білім деңгейіңізге сәйкес тесттер</p>
          <div class="quizzes-grid">
            <QuizCard
              v-for="quiz in recommendedQuizzes"
              :key="quiz.id"
              :quiz="quiz"
              @start-quiz="startQuiz"
            />
          </div>
        </div>
      </div>

      <!-- Admin Actions -->
      <div class="admin-actions" v-if="authStore.isAdmin">
        <BaseButton @click="showCreateModal = true" variant="primary" class="create-quiz-btn">
          <span class="button-icon">➕</span>
          Жаңа тест құру
        </BaseButton>
        <BaseButton 
          @click="$router.push('/admin?tab=questions')" 
          variant="outline"
        >
          <span class="button-icon">❓</span>
          Сұрақтарды басқару
        </BaseButton>
      </div>

      <!-- Create Quiz Modal -->
      <BaseModal
        v-model:isOpen="showCreateModal"
        title="Жаңа тест құру"
        size="xlarge"
      >
        <QuizManager 
          @quiz-created="handleQuizCreated" 
          @cancel="showCreateModal = false" 
        />
      </BaseModal>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '../stores/quizzes'
import { useAuthStore } from '../stores/auth'
import { useResultsStore } from '../stores/results'
import QuizCard from '../components/student/QuizCard.vue'
import QuizManager from '../components/admin/QuizManager.vue'
import BaseModal from '../components/common/BaseModal.vue'
import BaseButton from '../components/common/BaseButton.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'

export default {
  name: 'QuizListView',
  components: {
    QuizCard,
    QuizManager,
    BaseModal,
    BaseButton,
    LoadingSpinner
  },
  setup() {
    const router = useRouter()
    const quizStore = useQuizStore()
    const authStore = useAuthStore()
    const resultsStore = useResultsStore()

    const showCreateModal = ref(false)
    const filters = reactive({
      category: '',
      difficulty: '',
      status: 'all',
      search: ''
    })

    const categories = computed(() => {
      return quizStore.categories
    })

    const filteredQuizzes = computed(() => {
      let quizzes = quizStore.quizzes

      if (filters.category) {
        quizzes = quizzes.filter(quiz => quiz.category === filters.category)
      }

      if (filters.difficulty) {
        quizzes = quizzes.filter(quiz => quiz.difficulty === filters.difficulty)
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        quizzes = quizzes.filter(quiz =>
          quiz.title.toLowerCase().includes(searchLower) ||
          quiz.description.toLowerCase().includes(searchLower) ||
          quiz.category.toLowerCase().includes(searchLower)
        )
      }

      // Status filter for students
      if (authStore.isStudent && filters.status !== 'all') {
        const userResults = resultsStore.userResults
        quizzes = quizzes.filter(quiz => {
          const quizResults = userResults.filter(r => r.quizId === quiz.id)
          const hasCompleted = quizResults.length > 0
          const bestScore = hasCompleted ? Math.max(...quizResults.map(r => r.score)) : 0
          
          switch (filters.status) {
            case 'completed':
              return hasCompleted && bestScore >= 60
            case 'in-progress':
              return hasCompleted && bestScore < 60
            case 'not-started':
              return !hasCompleted
            default:
              return true
          }
        })
      }

      return quizzes
    })

    const activeQuizzes = computed(() => {
      return filteredQuizzes.value.filter(quiz => quiz.isActive)
    })

    const inactiveQuizzes = computed(() => {
      return filteredQuizzes.value.filter(quiz => !quiz.isActive)
    })

    const recommendedQuizzes = computed(() => {
      if (!authStore.isStudent) return []
      
      const userResults = resultsStore.userResults
      const userAverage = resultsStore.averageScore
      
      return activeQuizzes.value.filter(quiz => {
        // Recommend quizzes that user hasn't completed yet
        const hasCompleted = userResults.some(r => r.quizId === quiz.id)
        if (hasCompleted) return false
        
        // Recommend based on difficulty matching user level
        if (userAverage >= 80 && quiz.difficulty === 'hard') return true
        if (userAverage >= 60 && quiz.difficulty === 'medium') return true
        if (userAverage < 60 && quiz.difficulty === 'easy') return true
        
        return false
      }).slice(0, 3) // Limit to 3 recommendations
    })

    const hasActiveFilters = computed(() => {
      return filters.search || filters.category || filters.difficulty || filters.status !== 'all'
    })

    const userStats = computed(() => {
      if (!authStore.isStudent) return null
      
      const userResults = resultsStore.userResults
      const completedQuizzes = [...new Set(userResults.map(r => r.quizId))].length
      const averageScore = resultsStore.averageScore
      const bestScore = resultsStore.bestScore
      const totalAttempts = userResults.length
      
      return {
        completedQuizzes,
        averageScore,
        bestScore,
        totalAttempts
      }
    })

    const startQuiz = (quizId) => {
      router.push(`/quiz/${quizId}`)
    }

    const clearFilters = () => {
      filters.category = ''
      filters.difficulty = ''
      filters.status = 'all'
      filters.search = ''
    }

    const handleQuizCreated = () => {
      showCreateModal.value = false
      quizStore.loadQuizzes()
    }

    onMounted(async () => {
      await quizStore.loadQuizzes()
      if (authStore.isStudent) {
        await resultsStore.loadResults()
      }
    })

    return {
      quizStore,
      authStore,
      showCreateModal,
      filters,
      categories,
      filteredQuizzes,
      activeQuizzes,
      inactiveQuizzes,
      recommendedQuizzes,
      hasActiveFilters,
      userStats,
      startQuiz,
      clearFilters,
      handleQuizCreated
    }
  }
}
</script>

<style scoped>
.quiz-list-view {
  padding-bottom: var(--space-8);
}

.page-header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.page-title {
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: var(--space-2);
}

.page-subtitle {
  font-size: var(--text-lg);
  color: var(--gray-600);
  margin: 0;
}

.stats-banner {
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  color: white;
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  margin-bottom: var(--space-8);
  box-shadow: var(--shadow-lg);
}

.stats-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--space-6);
  margin-bottom: var(--space-4);
}

.stat {
  text-align: center;
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: 700;
  margin-bottom: var(--space-1);
}

.stat-label {
  font-size: var(--text-sm);
  opacity: 0.9;
}

.stats-motivation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.motivation-icon {
  font-size: var(--text-xl);
}

.motivation-text {
  font-size: var(--text-sm);
}

.filters-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: var(--space-6);
  margin-bottom: var(--space-8);
  padding: var(--space-6);
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  flex-wrap: wrap;
}

.filters {
  display: flex;
  gap: var(--space-6);
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.filter-label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--gray-700);
}

.filter-select {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius);
  background: white;
  font-size: var(--text-sm);
  min-width: 150px;
}

.search-controls {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 250px;
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

.clear-filters-btn {
  white-space: nowrap;
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

.empty-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
  flex-wrap: wrap;
}

.quizzes-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.quizzes-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.section-title {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: var(--space-2);
}

.section-subtitle {
  color: var(--gray-600);
  margin-bottom: var(--space-4);
}

.quizzes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--space-6);
}

.admin-notice {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--warning-50);
  border: 1px solid var(--warning-200);
  border-radius: var(--radius);
  color: var(--warning-700);
  margin-bottom: var(--space-4);
}

.notice-icon {
  font-size: var(--text-lg);
}

.notice-content {
  flex: 1;
  font-size: var(--text-sm);
}

.recommended-section {
  background: linear-gradient(135deg, var(--primary-50), var(--primary-100));
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  border: 1px solid var(--primary-200);
}

.admin-actions {
  display: flex;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-6);
  border-top: 1px solid var(--gray-200);
  margin-top: var(--space-8);
  flex-wrap: wrap;
}

.create-quiz-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.button-icon {
  font-size: var(--text-lg);
}

@media (max-width: 1024px) {
  .filters-section {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-4);
  }
  
  .filters {
    justify-content: space-between;
  }
  
  .search-controls {
    width: 100%;
    justify-content: space-between;
  }
  
  .search-box {
    flex: 1;
    min-width: auto;
  }
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
    gap: var(--space-4);
    width: 100%;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .filter-select {
    width: 100%;
  }
  
  .search-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .quizzes-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-content {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .admin-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .empty-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>