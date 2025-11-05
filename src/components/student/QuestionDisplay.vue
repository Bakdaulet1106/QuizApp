<template>
  <div class="question-display">
    <div class="question-header">
      <div class="question-meta">
        <span class="question-number">Сұрақ {{ currentQuestionIndex + 1 }} / {{ totalQuestions }}</span>
        <span class="difficulty-badge" :style="{ backgroundColor: getDifficultyColor(question.difficulty) }">
          {{ getDifficultyText(question.difficulty) }}
        </span>
      </div>
      <div class="question-progress">
        <div 
          class="progress-bar" 
          :style="{ width: progressPercentage + '%' }"
        ></div>
      </div>
    </div>

    <div class="question-content">
      <h3 class="question-text">{{ question.question }}</h3>
      
      <div class="options-list">
        <div
          v-for="(option, index) in question.options"
          :key="index"
          :class="['option', { 
            selected: selectedAnswer === index,
            correct: showResults && index === question.correctAnswer,
            incorrect: showResults && selectedAnswer === index && selectedAnswer !== question.correctAnswer,
            disabled: showResults
          }]"
          @click="selectAnswer(index)"
        >
          <div class="option-marker">
            <span class="option-letter">{{ String.fromCharCode(65 + index) }}</span>
            <div class="option-status" v-if="showResults">
              <span v-if="index === question.correctAnswer" class="correct-icon">✓</span>
              <span v-else-if="selectedAnswer === index && selectedAnswer !== question.correctAnswer" class="incorrect-icon">✗</span>
            </div>
          </div>
          <span class="option-text">{{ option }}</span>
        </div>
      </div>
    </div>

    <div class="question-explanation" v-if="showResults && question.explanation">
      <div class="explanation-header">
        <span class="explanation-icon">💡</span>
        <strong>Түсіндірме:</strong>
      </div>
      <p class="explanation-text">{{ question.explanation }}</p>
    </div>

    <div class="question-actions">
      <BaseButton 
        v-if="currentQuestionIndex > 0"
        variant="outline" 
        @click="$emit('previous')"
        class="nav-button"
      >
        <span class="button-icon">←</span>
        Алдыңғы
      </BaseButton>
      
      <div class="nav-spacer"></div>
      
      <BaseButton 
        v-if="currentQuestionIndex < totalQuestions - 1"
        :disabled="selectedAnswer === null && !showResults"
        @click="$emit('next')"
        variant="primary"
        class="nav-button"
      >
        Келесі
        <span class="button-icon">→</span>
      </BaseButton>
      
      <BaseButton 
        v-if="currentQuestionIndex === totalQuestions - 1 && !showResults"
        :disabled="selectedAnswer === null"
        variant="success"
        @click="$emit('complete')"
        class="submit-button"
      >
        <span class="button-icon">🏁</span>
        Тестті аяқтау
      </BaseButton>

      <BaseButton 
        v-if="showResults && currentQuestionIndex === totalQuestions - 1"
        variant="primary"
        @click="$emit('review-complete')"
        class="review-button"
      >
        Нәтижелерді қарау
      </BaseButton>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import BaseButton from '../common/BaseButton.vue'
import { getDifficultyColor, getDifficultyText } from '../../utils/helpers'

export default {
  name: 'QuestionDisplay',
  components: {
    BaseButton
  },
  props: {
    question: {
      type: Object,
      required: true
    },
    currentQuestionIndex: {
      type: Number,
      required: true
    },
    totalQuestions: {
      type: Number,
      required: true
    },
    selectedAnswer: {
      type: Number,
      default: null
    },
    showResults: {
      type: Boolean,
      default: false
    }
  },
  emits: ['answer-select', 'next', 'previous', 'complete', 'review-complete'],
  setup(props, { emit }) {
    const progressPercentage = computed(() => {
      return ((props.currentQuestionIndex + 1) / props.totalQuestions) * 100
    })

    const selectAnswer = (index) => {
      if (!props.showResults) {
        emit('answer-select', index)
      }
    }

    const isOptionCorrect = (index) => {
      return props.showResults && index === props.question.correctAnswer
    }

    const isOptionIncorrect = (index) => {
      return props.showResults && props.selectedAnswer === index && props.selectedAnswer !== props.question.correctAnswer
    }

    return {
      progressPercentage,
      selectAnswer,
      isOptionCorrect,
      isOptionIncorrect,
      getDifficultyColor,
      getDifficultyText
    }
  }
}
</script>

<style scoped>
.question-display {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--gray-200);
}

.question-header {
  margin-bottom: var(--space-6);
}

.question-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
  flex-wrap: wrap;
  gap: var(--space-2);
}

.question-number {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--gray-700);
  background: var(--gray-100);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius);
}

.difficulty-badge {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius);
  font-size: var(--text-xs);
  font-weight: 600;
  color: white;
  text-transform: capitalize;
}

.question-progress {
  height: 6px;
  background: var(--gray-200);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--primary-500);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.question-content {
  margin-bottom: var(--space-6);
}

.question-text {
  margin: 0 0 var(--space-6) 0;
  font-size: var(--text-xl);
  color: var(--gray-800);
  line-height: 1.5;
  font-weight: 600;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.option {
  display: flex;
  align-items: flex-start;
  padding: var(--space-4);
  border: 2px solid var(--gray-300);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition);
  gap: var(--space-4);
}

.option:hover:not(.disabled) {
  border-color: var(--primary-300);
  background: var(--gray-50);
  transform: translateY(-1px);
}

.option.selected {
  border-color: var(--primary-500);
  background: var(--primary-50);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}

.option.correct {
  border-color: var(--success-500);
  background: var(--success-50);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.1);
}

.option.incorrect {
  border-color: var(--error-500);
  background: var(--error-50);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.1);
}

.option.disabled {
  cursor: default;
}

.option-marker {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.option-letter {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--gray-200);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: var(--gray-700);
  transition: var(--transition);
  font-size: var(--text-sm);
}

.option.selected .option-letter {
  background: var(--primary-500);
  color: white;
}

.option.correct .option-letter {
  background: var(--success-500);
  color: white;
}

.option.incorrect .option-letter {
  background: var(--error-500);
  color: white;
}

.option-status {
  display: flex;
  align-items: center;
}

.correct-icon {
  color: var(--success-500);
  font-weight: bold;
  font-size: var(--text-lg);
}

.incorrect-icon {
  color: var(--error-500);
  font-weight: bold;
  font-size: var(--text-lg);
}

.option-text {
  flex: 1;
  font-size: var(--text-base);
  line-height: 1.4;
  color: var(--gray-700);
  font-weight: 500;
}

.question-explanation {
  background: var(--primary-50);
  border: 1px solid var(--primary-200);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  margin-bottom: var(--space-6);
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

.explanation-text {
  color: var(--primary-800);
  line-height: 1.5;
  margin: 0;
  font-size: var(--text-sm);
}

.question-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.nav-button {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 120px;
}

.nav-spacer {
  flex: 1;
}

.submit-button,
.review-button {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 160px;
}

.button-icon {
  font-size: var(--text-lg);
}

@media (max-width: 768px) {
  .question-display {
    padding: var(--space-4);
  }
  
  .question-text {
    font-size: var(--text-lg);
    margin-bottom: var(--space-4);
  }
  
  .option {
    padding: var(--space-3);
    gap: var(--space-3);
  }
  
  .question-actions {
    flex-direction: column;
    gap: var(--space-2);
  }
  
  .nav-spacer {
    display: none;
  }
  
  .nav-button,
  .submit-button,
  .review-button {
    width: 100%;
    justify-content: center;
  }
  
  .question-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }
}
</style>