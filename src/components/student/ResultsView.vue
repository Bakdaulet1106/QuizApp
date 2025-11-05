<template>
  <div class="results-view">
    <div class="container">
      <div class="results-header">
        <h1 class="page-title">Тест нәтижелері</h1>
        <p class="page-subtitle">Сіздің өнімділігіңізді және жетістіктеріңізді қараңыз</p>
      </div>

      <!-- Score Overview -->
      <BaseCard class="score-overview">
        <div class="score-main">
          <div class="score-circle" :class="scoreClass">
            <div class="score-value">{{ result.score }}%</div>
            <div class="score-label">Жалпы нәтиже</div>
            <div class="score-emoji">{{ scoreEmoji }}</div>
          </div>
          <div class="score-details">
            <div class="detail-item">
              <div class="detail-icon">✅</div>
              <div class="detail-content">
                <div class="detail-value">{{ result.correctAnswers }}</div>
                <div class="detail-label">Дұрыс жауаптар</div>
              </div>
            </div>
            <div class="detail-item">
              <div class="detail-icon">📊</div>
              <div class="detail-content">
                <div class="detail-value">{{ result.totalQuestions }}</div>
                <div class="detail-label">Барлық сұрақтар</div>
              </div>
            </div>
            <div class="detail-item">
              <div class="detail-icon">⏱️</div>
              <div class="detail-content">
                <div class="detail-value">{{ formatTime(result.timeSpent) }}</div>
                <div class="detail-label">Өткізген уақыт</div>
              </div>
            </div>
            <div class="detail-item">
              <div class="detail-icon">📅</div>
              <div class="detail-content">
                <div class="detail-value">{{ formatDate(result.submittedAt) }}</div>
                <div class="detail-label">Аяқталған күні</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="performance-indicator">
          <div class="performance-label">Өнімділік:</div>
          <div class="performance-value" :class="performanceClass">{{ performanceText }}</div>
        </div>
      </BaseCard>

      <!-- Answers Review -->
      <div class="answers-review">
        <h2 class="section-title">Жауаптарды шолу</h2>
        
        <div class="answers-summary">
          <div class="summary-cards">
            <div class="summary-card correct">
              <div class="summary-value">{{ result.correctAnswers }}</div>
              <div class="summary-label">Дұрыс</div>
            </div>
            <div class="summary-card incorrect">
              <div class="summary-value">{{ result.totalQuestions - result.correctAnswers }}</div>
              <div class="summary-label">Қате</div>
            </div>
            <div class="summary-card total">
              <div class="summary-value">{{ result.totalQuestions }}</div>
              <div class="summary-label">Барлығы</div>
            </div>
          </div>
        </div>

        <div class="questions-review">
          <div
            v-for="(question, index) in result.questions"
            :key="index"
            class="question-review"
          >
            <div class="question-header">
              <div class="question-number">Сұрақ {{ index + 1 }}</div>
              <div class="answer-status" :class="getAnswerStatus(index)">
                {{ getAnswerStatusIcon(index) }}
              </div>
            </div>
            
            <div class="question-content">
              <h4 class="question-text">{{ question.question }}</h4>
              
              <div class="options-review">
                <div
                  v-for="(option, optionIndex) in question.options"
                  :key="optionIndex"
                  :class="['option-review', {
                    correct: optionIndex === question.correctAnswer,
                    selected: result.userAnswers[index] === optionIndex,
                    incorrect: result.userAnswers[index] === optionIndex && result.userAnswers[index] !== question.correctAnswer
                  }]"
                >
                  <span class="option-letter">{{ String.fromCharCode(65 + optionIndex) }}</span>
                  <span class="option-text">{{ option }}</span>
                  <div class="option-markers">
                    <span v-if="optionIndex === question.correctAnswer" class="correct-marker">✓ Дұрыс жауап</span>
                    <span v-if="result.userAnswers[index] === optionIndex && result.userAnswers[index] !== question.correctAnswer" class="incorrect-marker">✗ Сіздің жауабыңыз</span>
                  </div>
                </div>
              </div>

              <div class="explanation" v-if="question.explanation">
                <div class="explanation-header">
                  <span class="explanation-icon">💡</span>
                  <strong>Түсіндірме:</strong>
                </div>
                <p>{{ question.explanation }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="results-actions">
        <BaseButton 
          @click="$emit('retry-quiz')" 
          variant="outline"
          class="action-button"
        >
          <span class="button-icon">🔄</span>
          Қайта өту
        </BaseButton>
        
        <BaseButton 
          @click="$emit('back-to-quizzes')" 
          variant="primary"
          class="action-button"
        >
          <span class="button-icon">📚</span>
          Тесттер тізімі
        </BaseButton>
        
        <BaseButton 
          @click="shareResults" 
          variant="secondary"
          class="action-button"
        >
          <span class="button-icon">📤</span>
          Бөлісу
        </BaseButton>
      </div>

      <!-- Progress Comparison -->
      <div class="progress-comparison" v-if="previousAttempts.length > 0">
        <h3 class="section-title">Алдыңғы нәтижелермен салыстыру</h3>
        <BaseCard>
          <div class="comparison-chart">
            <div
              v-for="(attempt, index) in previousAttempts"
              :key="attempt.id"
              class="attempt-bar"
            >
              <div class="attempt-info">
                <span class="attempt-date">{{ formatDateShort(attempt.submittedAt) }}</span>
                <span class="attempt-score">{{ attempt.score }}%</span>
              </div>
              <div class="bar-container">
                <div 
                  class="score-bar" 
                  :style="{ width: attempt.score + '%' }"
                  :class="getScoreClass(attempt.score)"
                ></div>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import BaseCard from '../common/BaseCard.vue'
import BaseButton from '../common/BaseButton.vue'
import { formatTime, formatDate, formatDateShort } from '../../utils/helpers'

export default {
  name: 'ResultsView',
  components: {
    BaseCard,
    BaseButton
  },
  props: {
    result: {
      type: Object,
      required: true
    },
    previousAttempts: {
      type: Array,
      default: () => []
    }
  },
  emits: ['retry-quiz', 'back-to-quizzes'],
  setup(props) {
    const scoreClass = computed(() => {
      if (props.result.score >= 80) return 'excellent'
      if (props.result.score >= 60) return 'good'
      if (props.result.score >= 40) return 'average'
      return 'poor'
    })

    const scoreEmoji = computed(() => {
      if (props.result.score >= 90) return '🎉'
      if (props.result.score >= 80) return '👍'
      if (props.result.score >= 60) return '😊'
      if (props.result.score >= 40) return '😐'
      return '😔'
    })

    const performanceText = computed(() => {
      if (props.result.score >= 90) return 'Тамаша!'
      if (props.result.score >= 80) return 'Өте жақсы!'
      if (props.result.score >= 70) return 'Жақсы'
      if (props.result.score >= 60) return 'Орташа'
      if (props.result.score >= 50) return 'Қанағаттанарлық'
      return 'Жақсарту қажет'
    })

    const performanceClass = computed(() => {
      if (props.result.score >= 80) return 'excellent'
      if (props.result.score >= 60) return 'good'
      if (props.result.score >= 40) return 'average'
      return 'poor'
    })

    const getAnswerStatus = (index) => {
      const userAnswer = props.result.userAnswers[index]
      const correctAnswer = props.result.questions[index].correctAnswer
      return userAnswer === correctAnswer ? 'correct' : 'incorrect'
    }

    const getAnswerStatusIcon = (index) => {
      return getAnswerStatus(index) === 'correct' ? '✅' : '❌'
    }

    const getScoreClass = (score) => {
      if (score >= 80) return 'excellent'
      if (score >= 60) return 'good'
      if (score >= 40) return 'average'
      return 'poor'
    }

    const shareResults = () => {
      const text = `Мен "${props.result.quizTitle}" тестінен ${props.result.score}% нәтиже алдым! ${props.result.correctAnswers}/${props.result.totalQuestions} дұрыс жауап.`
      
      if (navigator.share) {
        navigator.share({
          title: 'Тест нәтижелерім',
          text: text,
          url: window.location.href
        })
      } else {
        navigator.clipboard.writeText(text)
        alert('Нәтижелер буферге көшірілді!')
      }
    }

    return {
      scoreClass,
      scoreEmoji,
      performanceText,
      performanceClass,
      formatTime,
      formatDate,
      formatDateShort,
      getAnswerStatus,
      getAnswerStatusIcon,
      getScoreClass,
      shareResults
    }
  }
}
</script>

<style scoped>
.results-view {
  padding-bottom: var(--space-8);
}

.results-header {
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

.score-overview {
  margin-bottom: var(--space-8);
}

.score-main {
  display: flex;
  align-items: center;
  gap: var(--space-8);
  margin-bottom: var(--space-6);
  flex-wrap: wrap;
}

.score-circle {
  text-align: center;
  flex-shrink: 0;
  position: relative;
  padding: var(--space-4);
  border-radius: 50%;
  width: 180px;
  height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 8px solid;
}

.score-circle.excellent {
  border-color: var(--success-500);
  background: var(--success-50);
  color: var(--success-700);
}

.score-circle.good {
  border-color: var(--primary-500);
  background: var(--primary-50);
  color: var(--primary-700);
}

.score-circle.average {
  border-color: var(--warning-500);
  background: var(--warning-50);
  color: var(--warning-700);
}

.score-circle.poor {
  border-color: var(--error-500);
  background: var(--error-50);
  color: var(--error-700);
}

.score-value {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: var(--space-1);
}

.score-label {
  font-size: var(--text-sm);
  font-weight: 600;
  margin-bottom: var(--space-2);
}

.score-emoji {
  font-size: var(--text-2xl);
}

.score-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
  flex: 1;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--gray-50);
  border-radius: var(--radius-lg);
  border: 1px solid var(--gray-200);
}

.detail-icon {
  font-size: var(--text-xl);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: var(--radius);
  flex-shrink: 0;
}

.detail-content {
  flex: 1;
}

.detail-value {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: var(--space-1);
}

.detail-label {
  color: var(--gray-600);
  font-size: var(--text-sm);
  font-weight: 500;
}

.performance-indicator {
  text-align: center;
  padding: var(--space-4);
  background: var(--gray-50);
  border-radius: var(--radius-lg);
  border: 1px solid var(--gray-200);
}

.performance-label {
  font-size: var(--text-sm);
  color: var(--gray-600);
  margin-bottom: var(--space-1);
}

.performance-value {
  font-size: var(--text-xl);
  font-weight: 700;
}

.performance-value.excellent {
  color: var(--success-600);
}

.performance-value.good {
  color: var(--primary-600);
}

.performance-value.average {
  color: var(--warning-600);
}

.performance-value.poor {
  color: var(--error-600);
}

.section-title {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: var(--space-6);
}

.answers-summary {
  margin-bottom: var(--space-6);
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}

.summary-card {
  text-align: center;
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  border: 2px solid;
}

.summary-card.correct {
  border-color: var(--success-200);
  background: var(--success-50);
  color: var(--success-700);
}

.summary-card.incorrect {
  border-color: var(--error-200);
  background: var(--error-50);
  color: var(--error-700);
}

.summary-card.total {
  border-color: var(--primary-200);
  background: var(--primary-50);
  color: var(--primary-700);
}

.summary-value {
  font-size: var(--text-3xl);
  font-weight: 700;
  margin-bottom: var(--space-1);
}

.summary-label {
  font-size: var(--text-sm);
  font-weight: 600;
}

.questions-review {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.question-review {
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  background: var(--gray-50);
  border-bottom: 1px solid var(--gray-200);
}

.question-number {
  font-weight: 600;
  color: var(--gray-700);
}

.answer-status.correct {
  color: var(--success-600);
  font-weight: 600;
}

.answer-status.incorrect {
  color: var(--error-600);
  font-weight: 600;
}

.question-content {
  padding: var(--space-4);
}

.question-text {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: var(--space-4);
  line-height: 1.4;
}

.options-review {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.option-review {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius);
  border: 1px solid var(--gray-200);
  position: relative;
}

.option-review.correct {
  background: var(--success-50);
  border-color: var(--success-200);
}

.option-review.selected {
  background: var(--primary-50);
  border-color: var(--primary-200);
}

.option-review.incorrect {
  background: var(--error-50);
  border-color: var(--error-200);
}

.option-letter {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--gray-200);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: var(--text-xs);
  flex-shrink: 0;
}

.option-review.correct .option-letter {
  background: var(--success-500);
  color: white;
}

.option-review.incorrect .option-letter {
  background: var(--error-500);
  color: white;
}

.option-text {
  flex: 1;
  font-weight: 500;
}

.option-markers {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.correct-marker {
  color: var(--success-600);
  font-size: var(--text-xs);
  font-weight: 600;
  padding: var(--space-1) var(--space-2);
  background: var(--success-100);
  border-radius: var(--radius);
}

.incorrect-marker {
  color: var(--error-600);
  font-size: var(--text-xs);
  font-weight: 600;
  padding: var(--space-1) var(--space-2);
  background: var(--error-100);
  border-radius: var(--radius);
}

.explanation {
  background: var(--primary-50);
  border: 1px solid var(--primary-200);
  border-radius: var(--radius);
  padding: var(--space-3);
}

.explanation-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
  color: var(--primary-700);
  font-size: var(--text-sm);
}

.explanation-icon {
  font-size: var(--text-lg);
}

.results-actions {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  margin: var(--space-8) 0;
  flex-wrap: wrap;
}

.action-button {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 160px;
}

.button-icon {
  font-size: var(--text-lg);
}

.progress-comparison {
  margin-top: var(--space-8);
}

.comparison-chart {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.attempt-bar {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.attempt-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 150px;
  font-size: var(--text-sm);
}

.attempt-date {
  color: var(--gray-600);
}

.attempt-score {
  font-weight: 600;
  color: var(--gray-700);
}

.bar-container {
  flex: 1;
  height: 24px;
  background: var(--gray-200);
  border-radius: 12px;
  overflow: hidden;
}

.score-bar {
  height: 100%;
  border-radius: 12px;
  transition: width 0.5s ease;
}

.score-bar.excellent {
  background: var(--success-500);
}

.score-bar.good {
  background: var(--primary-500);
}

.score-bar.average {
  background: var(--warning-500);
}

.score-bar.poor {
  background: var(--error-500);
}

@media (max-width: 768px) {
  .score-main {
    flex-direction: column;
    text-align: center;
  }
  
  .score-details {
    grid-template-columns: 1fr;
  }
  
  .summary-cards {
    grid-template-columns: 1fr;
  }
  
  .results-actions {
    flex-direction: column;
  }
  
  .action-button {
    width: 100%;
    justify-content: center;
  }
  
  .attempt-bar {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-2);
  }
  
  .attempt-info {
    min-width: auto;
  }
}
</style>