<template>
  <BaseCard class="quiz-card" hoverable>
    <div class="quiz-header">
      <h3 class="quiz-title">{{ quiz.title }}</h3>
      <div class="quiz-meta">
        <span class="meta-item">
          <span class="meta-icon">❓</span>
          {{ quiz.questions.length }} сұрақ
        </span>
        <span class="meta-item">
          <span class="meta-icon">⏱️</span>
          {{ formatTime(quiz.duration) }}
        </span>
        <span class="meta-item" v-if="quiz.category">
          <span class="meta-icon">📁</span>
          {{ quiz.category }}
        </span>
      </div>
    </div>
    
    <p class="quiz-description">{{ quiz.description }}</p>
    
    <div class="quiz-stats" v-if="quizStats">
      <div class="stat">
        <span class="stat-value">{{ quizStats.averageScore }}%</span>
        <span class="stat-label">Орташа нәтиже</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ quizStats.attempts }}</span>
        <span class="stat-label">Өтулер</span>
      </div>
      <div class="stat" v-if="userBestScore !== null">
        <span class="stat-value">{{ userBestScore }}%</span>
        <span class="stat-label">Сіздің ең үздік нәтижеңіз</span>
      </div>
    </div>
    
    <div class="quiz-footer">
      <div class="difficulty" v-if="quiz.difficulty">
        <span class="difficulty-badge" :style="{ backgroundColor: getDifficultyColor(quiz.difficulty) }">
          {{ getDifficultyText(quiz.difficulty) }}
        </span>
      </div>
      <BaseButton 
        @click="$emit('start-quiz', quiz.id)" 
        variant="primary"
        class="start-button"
      >
        <span class="button-icon">🚀</span>
        Тестті бастау
      </BaseButton>
    </div>

    <div class="quiz-progress" v-if="userProgress">
      <div class="progress-info">
        <span>Соңғы өту:</span>
        <span class="progress-score">{{ userProgress.score }}%</span>
      </div>
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: userProgress.score + '%' }"
          :class="getScoreClass(userProgress.score)"
        ></div>
      </div>
    </div>
  </BaseCard>
</template>

<script>
import { computed } from 'vue'
import { useResultsStore } from '../../stores/results'
import { useAuthStore } from '../../stores/auth'
import BaseCard from '../common/BaseCard.vue'
import BaseButton from '../common/BaseButton.vue'
import { formatTime, getDifficultyColor, getDifficultyText } from '../../utils/helpers'

export default {
  name: 'QuizCard',
  components: {
    BaseCard,
    BaseButton
  },
  props: {
    quiz: {
      type: Object,
      required: true
    }
  },
  emits: ['start-quiz'],
  setup(props) {
    const resultsStore = useResultsStore()
    const authStore = useAuthStore()

    const quizStats = computed(() => {
      const stats = resultsStore.statistics.byQuiz[props.quiz.id]
      return stats ? {
        averageScore: Math.round(stats.averageScore),
        attempts: stats.attempts,
        bestScore: stats.bestScore
      } : null
    })

    const userBestScore = computed(() => {
      const userResults = resultsStore.userResults.filter(r => r.quizId === props.quiz.id)
      if (userResults.length === 0) return null
      return Math.max(...userResults.map(r => r.score))
    })

    const userProgress = computed(() => {
      const userResults = resultsStore.userResults
        .filter(r => r.quizId === props.quiz.id)
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
      
      return userResults.length > 0 ? userResults[0] : null
    })

    const getScoreClass = (score) => {
      if (score >= 80) return 'excellent'
      if (score >= 60) return 'good'
      if (score >= 40) return 'average'
      return 'poor'
    }

    return {
      formatTime,
      getDifficultyColor,
      getDifficultyText,
      quizStats,
      userBestScore,
      userProgress,
      getScoreClass
    }
  }
}
</script>

<style scoped>
.quiz-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}

.quiz-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-500), var(--primary-600));
}

.quiz-header {
  margin-bottom: var(--space-4);
}

.quiz-title {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: var(--space-3);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.quiz-meta {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  color: var(--gray-600);
  background: var(--gray-100);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius);
}

.meta-icon {
  font-size: var(--text-xs);
}

.quiz-description {
  color: var(--gray-600);
  line-height: 1.5;
  margin-bottom: var(--space-6);
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.quiz-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-4);
  padding: var(--space-3);
  background: var(--gray-50);
  border-radius: var(--radius);
  border: 1px solid var(--gray-200);
}

.stat {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--primary-600);
  margin-bottom: var(--space-1);
}

.stat-label {
  font-size: var(--text-xs);
  color: var(--gray-600);
  line-height: 1.2;
}

.quiz-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.difficulty-badge {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius);
  font-size: var(--text-xs);
  font-weight: 600;
  color: white;
  text-transform: capitalize;
}

.start-button {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-weight: 600;
}

.button-icon {
  font-size: var(--text-lg);
}

.quiz-progress {
  padding-top: var(--space-3);
  border-top: 1px solid var(--gray-200);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
  font-size: var(--text-sm);
  color: var(--gray-600);
}

.progress-score {
  font-weight: 600;
  color: var(--gray-700);
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: var(--gray-200);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
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

@media (max-width: 640px) {
  .quiz-footer {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-3);
  }
  
  .quiz-stats {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-2);
  }
  
  .stat-value {
    font-size: var(--text-base);
  }
  
  .stat-label {
    font-size: var(--text-xs);
  }
  
  .meta-item {
    font-size: var(--text-xs);
  }
}
</style>