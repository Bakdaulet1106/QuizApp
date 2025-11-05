<template>
  <div class="dashboard-view">
    <div class="container">
      <!-- Welcome Section -->
      <section class="welcome-section">
        <div class="welcome-content">
          <h1 class="welcome-title">
            Қайырлы күн, {{ authStore.userName }}!
          </h1>
          <p class="welcome-subtitle">
            {{ dashboardMessage }}
          </p>
          <div class="welcome-actions" v-if="authStore.isStudent">
            <BaseButton 
              @click="$router.push('/quizzes')" 
              variant="primary"
              class="action-button"
            >
              <span class="button-icon">🚀</span>
              Тестті бастау
            </BaseButton>
            <BaseButton 
              @click="$router.push('/results')" 
              variant="outline"
              class="action-button"
            >
              <span class="button-icon">📊</span>
              Нәтижелерді қарау
            </BaseButton>
          </div>
          <div class="welcome-actions" v-if="authStore.isAdmin">
            <BaseButton 
              @click="$router.push('/admin')" 
              variant="primary"
              class="action-button"
            >
              <span class="button-icon">⚙️</span>
              Әкімші панелі
            </BaseButton>
            <BaseButton 
              @click="$router.push('/admin?tab=questions')" 
              variant="outline"
              class="action-button"
            >
              <span class="button-icon">❓</span>
              Сұрақтарды басқару
            </BaseButton>
          </div>
        </div>
        <div class="welcome-stats" v-if="authStore.isStudent">
          <div class="stat-card primary">
            <div class="stat-icon">📚</div>
            <div class="stat-content">
              <div class="stat-value">{{ completedQuizzes }}</div>
              <div class="stat-label">Аяқталған тесттер</div>
            </div>
          </div>
          <div class="stat-card success">
            <div class="stat-icon">📈</div>
            <div class="stat-content">
              <div class="stat-value">{{ averageScore }}%</div>
              <div class="stat-label">Орташа нәтиже</div>
            </div>
          </div>
          <div class="stat-card warning">
            <div class="stat-icon">⏱️</div>
            <div class="stat-content">
              <div class="stat-value">{{ totalTimeSpent }}</div>
              <div class="stat-label">Жұмсалған уақыт</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Quick Actions -->
      <section class="actions-section">
        <h2 class="section-title">Жылдам әрекеттер</h2>
        <div class="actions-grid">
          <router-link to="/quizzes" class="action-card">
            <div class="action-icon">📝</div>
            <div class="action-content">
              <h3>Тест тапсыру</h3>
              <p>Экономика пәні бойынша біліміңізді сынаңыз</p>
            </div>
            <div class="action-arrow">→</div>
          </router-link>
          
          <router-link to="/results" class="action-card" v-if="authStore.isStudent">
            <div class="action-icon">📊</div>
            <div class="action-content">
              <h3>Нәтижелерді қарау</h3>
              <p>Алдыңғы тест нәтижелеріңізді талдаңыз</p>
            </div>
            <div class="action-arrow">→</div>
          </router-link>
          
          <router-link to="/admin" class="action-card" v-if="authStore.isAdmin">
            <div class="action-icon">⚙️</div>
            <div class="action-content">
              <h3>Әкімші панелі</h3>
              <p>Тесттер мен сұрақтарды басқарыңыз</p>
            </div>
            <div class="action-arrow">→</div>
          </router-link>
          
          <div class="action-card" v-if="authStore.isStudent">
            <div class="action-icon">🎯</div>
            <div class="action-content">
              <h3>Прогрессіңіз</h3>
              <p>Оқу жетістіктеріңізді бақылаңыз</p>
            </div>
            <div class="progress-ring">
              <div class="progress-circle" :style="progressStyle"></div>
              <span class="progress-value">{{ learningProgress }}%</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Recent Activity -->
      <section class="activity-section" v-if="authStore.isStudent && recentResults.length > 0">
        <div class="section-header">
          <h2 class="section-title">Соңғы белсенділік</h2>
          <router-link to="/results" class="view-all-link">Барлығын қарау →</router-link>
        </div>
        <BaseCard>
          <div class="activity-list">
            <div v-for="result in recentResults" :key="result.id" class="activity-item">
              <div class="activity-icon" :class="getScoreClass(result.score)">
                {{ getScoreIcon(result.score) }}
              </div>
              <div class="activity-info">
                <h4 class="quiz-title">{{ result.quizTitle }}</h4>
                <p class="activity-date">{{ formatDate(result.submittedAt) }}</p>
              </div>
              <div class="activity-score">
                <span class="score-value">{{ result.score }}%</span>
                <div class="score-bar">
                  <div 
                    class="score-progress" 
                    :style="{ width: result.score + '%' }"
                    :class="getScoreClass(result.score)"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </BaseCard>
      </section>

      <!-- Admin Quick Stats -->
      <section class="admin-section" v-if="authStore.isAdmin">
        <h2 class="section-title">Әкімшіге арналған шолу</h2>
        <div class="stats-grid">
          <BaseCard class="stat-item">
            <div class="stat-content">
              <div class="stat-icon">📊</div>
              <div class="stat-details">
                <div class="stat-number">{{ totalQuizzes }}</div>
                <div class="stat-description">Барлық тесттер</div>
              </div>
            </div>
          </BaseCard>
          <BaseCard class="stat-item">
            <div class="stat-content">
              <div class="stat-icon">❓</div>
              <div class="stat-details">
                <div class="stat-number">{{ totalQuestions }}</div>
                <div class="stat-description">Сұрақтар қоры</div>
              </div>
            </div>
          </BaseCard>
          <BaseCard class="stat-item">
            <div class="stat-content">
              <div class="stat-icon">👥</div>
              <div class="stat-details">
                <div class="stat-number">{{ totalUsers }}</div>
                <div class="stat-description">Тіркелгілер</div>
              </div>
            </div>
          </BaseCard>
          <BaseCard class="stat-item">
            <div class="stat-content">
              <div class="stat-icon">📈</div>
              <div class="stat-details">
                <div class="stat-number">{{ totalResults }}</div>
                <div class="stat-description">Тест өтулер</div>
              </div>
            </div>
          </BaseCard>
        </div>

        <!-- Recent User Activity -->
        <div class="recent-activity" v-if="recentUserActivity.length > 0">
          <h3 class="subsection-title">Соңғы пайдаланушы белсенділігі</h3>
          <BaseCard>
            <div class="user-activity-list">
              <div 
                v-for="activity in recentUserActivity" 
                :key="activity.id" 
                class="user-activity-item"
              >
                <div class="user-avatar">
                  {{ getUserInitial(activity.userName) }}
                </div>
                <div class="activity-details">
                  <div class="user-name">{{ activity.userName }}</div>
                  <div class="activity-text">{{ activity.quizTitle }} тестін аяқтады</div>
                  <div class="activity-meta">
                    <span class="score">{{ activity.score }}%</span>
                    <span class="time">{{ formatTimeAgo(activity.submittedAt) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>
      </section>

      <!-- Learning Progress -->
      <section class="progress-section" v-if="authStore.isStudent && hasProgress">
        <h2 class="section-title">Оқу прогрессі</h2>
        <div class="progress-cards">
          <BaseCard class="progress-card">
            <h3>Санаттар бойынша нәтижелер</h3>
            <div class="category-progress">
              <div 
                v-for="(progress, category) in categoryProgress" 
                :key="category"
                class="category-item"
              >
                <div class="category-info">
                  <span class="category-name">{{ category }}</span>
                  <span class="category-score">{{ progress.score }}%</span>
                </div>
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: progress.score + '%' }"
                    :class="getScoreClass(progress.score)"
                  ></div>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useResultsStore } from '../stores/results'
import { useQuizStore } from '../stores/quizzes'
import { useQuestionStore } from '../stores/questions'
import BaseCard from '../components/common/BaseCard.vue'
import BaseButton from '../components/common/BaseButton.vue'
import { formatDate, formatTime } from '../utils/helpers'

export default {
  name: 'DashboardView',
  components: {
    BaseCard,
    BaseButton
  },
  setup() {
    const authStore = useAuthStore()
    const resultsStore = useResultsStore()
    const quizStore = useQuizStore()
    const questionStore = useQuestionStore()

    const dashboardMessage = computed(() => {
      if (authStore.isAdmin) {
        return 'Тест платформасын басқарып, студенттердің прогрессін бақылаңыз.'
      } else {
        return 'Оқу жолыңызды жалғастырып, прогрессіңізді бақылаңыз.'
      }
    })

    const completedQuizzes = computed(() => {
      return resultsStore.userResults.length
    })

    const averageScore = computed(() => {
      return resultsStore.averageScore
    })

    const totalTimeSpent = computed(() => {
      const totalSeconds = resultsStore.userResults.reduce((total, result) => total + result.timeSpent, 0)
      return formatTime(totalSeconds)
    })

    const recentResults = computed(() => {
      return resultsStore.recentResults
    })

    const totalQuizzes = computed(() => {
      return quizStore.quizzes.length
    })

    const totalQuestions = computed(() => {
      return questionStore.questions.length
    })

    const totalResults = computed(() => {
      return resultsStore.results.length
    })

    const totalUsers = computed(() => {
      // This would come from an API in a real app
      return 42 // Mock data
    })

    const recentUserActivity = computed(() => {
      return resultsStore.results
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
        .slice(0, 5)
    })

    const learningProgress = computed(() => {
      if (resultsStore.userResults.length === 0) return 0
      const totalScore = resultsStore.userResults.reduce((sum, result) => sum + result.score, 0)
      return Math.round(totalScore / resultsStore.userResults.length)
    })

    const progressStyle = computed(() => {
      const progress = learningProgress.value
      return {
        '--progress': `${progress}%`,
        'background': `conic-gradient(var(--primary-500) ${progress}%, var(--gray-200) ${progress}%)`
      }
    })

    const hasProgress = computed(() => {
      return resultsStore.userResults.length > 0
    })

    const categoryProgress = computed(() => {
      const categories = {}
      resultsStore.userResults.forEach(result => {
        if (!categories[result.quizTitle]) {
          categories[result.quizTitle] = { total: 0, count: 0 }
        }
        categories[result.quizTitle].total += result.score
        categories[result.quizTitle].count++
      })

      const progress = {}
      Object.keys(categories).forEach(category => {
        progress[category] = {
          score: Math.round(categories[category].total / categories[category].count)
        }
      })

      return progress
    })

    const getScoreClass = (score) => {
      if (score >= 80) return 'excellent'
      if (score >= 60) return 'good'
      if (score >= 40) return 'average'
      return 'poor'
    }

    const getScoreIcon = (score) => {
      if (score >= 90) return '🎉'
      if (score >= 80) return '👍'
      if (score >= 60) return '😊'
      if (score >= 40) return '😐'
      return '😔'
    }

    const getUserInitial = (userName) => {
      return userName ? userName.charAt(0).toUpperCase() : 'U'
    }

    const formatTimeAgo = (dateString) => {
      const date = new Date(dateString)
      const now = new Date()
      const diffInMinutes = Math.floor((now - date) / (1000 * 60))
      
      if (diffInMinutes < 1) return 'Қазір'
      if (diffInMinutes < 60) return `${diffInMinutes} мин бұрын`
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} сағ бұрын`
      return `${Math.floor(diffInMinutes / 1440)} күн бұрын`
    }

    onMounted(async () => {
      if (authStore.isStudent) {
        await resultsStore.loadResults()
      }
      if (authStore.isAdmin) {
        await Promise.all([
          quizStore.loadQuizzes(),
          questionStore.loadQuestions(),
          resultsStore.loadResults()
        ])
      }
    })

    return {
      authStore,
      dashboardMessage,
      completedQuizzes,
      averageScore,
      totalTimeSpent,
      recentResults,
      totalQuizzes,
      totalQuestions,
      totalResults,
      totalUsers,
      recentUserActivity,
      learningProgress,
      progressStyle,
      hasProgress,
      categoryProgress,
      formatDate,
      getScoreClass,
      getScoreIcon,
      getUserInitial,
      formatTimeAgo
    }
  }
}
</script>

<style scoped>
.dashboard-view {
  padding-bottom: var(--space-8);
}

.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-8);
  gap: var(--space-8);
  flex-wrap: wrap;
}

.welcome-content {
  flex: 1;
  min-width: 300px;
}

.welcome-title {
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: var(--space-2);
  line-height: 1.2;
}

.welcome-subtitle {
  font-size: var(--text-lg);
  color: var(--gray-600);
  margin-bottom: var(--space-6);
  line-height: 1.5;
}

.welcome-actions {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.action-button {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.button-icon {
  font-size: var(--text-lg);
}

.welcome-stats {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  min-width: 200px;
  transition: var(--transition);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.stat-card.primary {
  background: var(--primary-500);
  color: white;
}

.stat-card.success {
  background: var(--success-500);
  color: white;
}

.stat-card.warning {
  background: var(--warning-500);
  color: white;
}

.stat-icon {
  font-size: var(--text-2xl);
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
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

.section-title {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: var(--space-6);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.view-all-link {
  color: var(--primary-500);
  text-decoration: none;
  font-weight: 500;
  font-size: var(--text-sm);
}

.view-all-link:hover {
  text-decoration: underline;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-6);
  margin-bottom: var(--space-8);
}

.action-card {
  background: white;
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  text-decoration: none;
  color: inherit;
  transition: var(--transition);
  border: 1px solid var(--gray-200);
  display: flex;
  align-items: center;
  gap: var(--space-4);
  position: relative;
  overflow: hidden;
}

.action-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
  border-color: var(--primary-300);
}

.action-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-500), var(--primary-600));
}

.action-icon {
  font-size: var(--text-2xl);
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-100);
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

.action-content {
  flex: 1;
}

.action-content h3 {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: var(--space-1);
}

.action-content p {
  color: var(--gray-600);
  margin: 0;
  line-height: 1.5;
  font-size: var(--text-sm);
}

.action-arrow {
  color: var(--primary-500);
  font-size: var(--text-lg);
  font-weight: bold;
  transition: var(--transition);
}

.action-card:hover .action-arrow {
  transform: translateX(4px);
}

.progress-ring {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--gray-200);
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-circle {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  mask: radial-gradient(transparent 50%, #000 51%);
}

.progress-value {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--gray-700);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.activity-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-3);
  border-radius: var(--radius);
  transition: var(--transition);
}

.activity-item:hover {
  background: var(--gray-50);
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-lg);
  flex-shrink: 0;
}

.activity-icon.excellent {
  background: var(--success-100);
  color: var(--success-600);
}

.activity-icon.good {
  background: var(--primary-100);
  color: var(--primary-600);
}

.activity-icon.average {
  background: var(--warning-100);
  color: var(--warning-600);
}

.activity-icon.poor {
  background: var(--error-100);
  color: var(--error-600);
}

.activity-info {
  flex: 1;
}

.quiz-title {
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: var(--space-1);
}

.activity-date {
  color: var(--gray-500);
  font-size: var(--text-sm);
  margin: 0;
}

.activity-score {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 100px;
}

.score-value {
  font-weight: 600;
  color: var(--gray-700);
  min-width: 40px;
  text-align: right;
}

.score-bar {
  width: 80px;
  height: 6px;
  background: var(--gray-200);
  border-radius: 3px;
  overflow: hidden;
}

.score-progress {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.score-progress.excellent {
  background: var(--success-500);
}

.score-progress.good {
  background: var(--primary-500);
}

.score-progress.average {
  background: var(--warning-500);
}

.score-progress.poor {
  background: var(--error-500);
}

.admin-section {
  margin-top: var(--space-8);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-6);
  margin-bottom: var(--space-8);
}

.stat-item {
  transition: var(--transition);
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.stat-content {
  padding: var(--space-6);
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.stat-icon {
  font-size: var(--text-2xl);
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-100);
  border-radius: var(--radius-lg);
  color: var(--primary-600);
  flex-shrink: 0;
}

.stat-details {
  flex: 1;
}

.stat-number {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: var(--space-1);
}

.stat-description {
  color: var(--gray-600);
  font-weight: 500;
}

.subsection-title {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: var(--space-4);
}

.user-activity-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.user-activity-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius);
  transition: var(--transition);
}

.user-activity-item:hover {
  background: var(--gray-50);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-500);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.activity-details {
  flex: 1;
}

.user-name {
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: var(--space-1);
}

.activity-text {
  color: var(--gray-600);
  font-size: var(--text-sm);
  margin-bottom: var(--space-1);
}

.activity-meta {
  display: flex;
  gap: var(--space-3);
  font-size: var(--text-xs);
  color: var(--gray-500);
}

.score {
  font-weight: 600;
  color: var(--primary-600);
}

.progress-section {
  margin-top: var(--space-8);
}

.progress-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--space-6);
}

.progress-card h3 {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: var(--space-4);
}

.category-progress {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.category-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.category-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-name {
  font-weight: 500;
  color: var(--gray-700);
}

.category-score {
  font-weight: 600;
  color: var(--gray-900);
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
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-fill.excellent {
  background: var(--success-500);
}

.progress-fill.good {
  background: var(--primary-500);
}

.progress-fill.average {
  background: var(--warning-500);
}

.progress-fill.poor {
  background: var(--error-500);
}

@media (max-width: 768px) {
  .welcome-section {
    flex-direction: column;
    text-align: center;
  }
  
  .welcome-stats {
    justify-content: center;
  }
  
  .stat-card {
    min-width: 150px;
  }
  
  .activity-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
  }
  
  .activity-score {
    width: 100%;
    justify-content: space-between;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .progress-cards {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .welcome-actions {
    justify-content: center;
  }
}
</style>