<template>
  <form @submit.prevent="handleSubmit" class="question-form">
    <div class="form-section">
      <h3>Сұрақ мәліметтері</h3>
      
      <div class="form-group">
        <label for="question-text" class="form-label">Сұрақ мәтіні *</label>
        <textarea
          id="question-text"
          v-model="form.question"
          class="form-textarea"
          :class="{ error: errors.question }"
          placeholder="Сұрақты енгізіңіз..."
          rows="3"
          required
        ></textarea>
        <div v-if="errors.question" class="error-message">{{ errors.question }}</div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="category" class="form-label">Санат *</label>
          <select
            id="category"
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
          <label for="difficulty" class="form-label">Қиындық деңгейі *</label>
          <select
            id="difficulty"
            v-model="form.difficulty"
            class="form-select"
            :class="{ error: errors.difficulty }"
            required
          >
            <option value="">Қиындық деңгейін таңдаңыз</option>
            <option value="easy">Оңай</option>
            <option value="medium">Орташа</option>
            <option value="hard">Қиын</option>
          </select>
          <div v-if="errors.difficulty" class="error-message">{{ errors.difficulty }}</div>
        </div>
      </div>

      <div class="form-group">
        <label for="explanation" class="form-label">Түсіндірме (міндетті емес)</label>
        <textarea
          id="explanation"
          v-model="form.explanation"
          class="form-textarea"
          placeholder="Дұрыс жауаптың түсіндірмесін жазыңыз..."
          rows="2"
        ></textarea>
      </div>
    </div>

    <div class="form-section">
      <h3>Жауап нұсқалары</h3>
      
      <div class="options-list">
        <div
          v-for="(option, index) in form.options"
          :key="index"
          class="option-row"
        >
          <div class="option-input-group">
            <div class="option-marker">{{ String.fromCharCode(65 + index) }}</div>
            <input
              v-model="form.options[index]"
              type="text"
              class="form-input"
              :class="{ error: errors.options && errors.options[index] }"
              :placeholder="`${String.fromCharCode(65 + index)} нұсқасы`"
              required
            />
            <button
              type="button"
              @click="removeOption(index)"
              class="remove-option-btn"
              :disabled="form.options.length <= 2"
              title="Нұсқаны жою"
            >
              &times;
            </button>
          </div>
          <div v-if="errors.options && errors.options[index]" class="error-message">
            {{ errors.options[index] }}
          </div>
        </div>
      </div>

      <BaseButton
        type="button"
        @click="addOption"
        variant="outline"
        size="small"
        :disabled="form.options.length >= 6"
        class="add-option-btn"
      >
        <span class="button-icon">+</span>
        Нұсқа қосу
      </BaseButton>

      <div class="options-info">
        <span class="info-text">Қазіргі уақытта {{ form.options.length }} нұсқа бар</span>
        <span class="info-text">Минимум: 2, Максимум: 6</span>
      </div>
    </div>

    <div class="form-section">
      <h3>Дұрыс жауап</h3>
      
      <div class="correct-answer-selector">
        <div
          v-for="(option, index) in form.options"
          :key="index"
          @click="form.correctAnswer = index"
          :class="[
            'answer-option',
            { selected: form.correctAnswer === index }
          ]"
        >
          <div class="option-marker">{{ String.fromCharCode(65 + index) }}</div>
          <div class="option-text">{{ option || `${String.fromCharCode(65 + index)} нұсқасы` }}</div>
          <div class="selection-indicator" v-if="form.correctAnswer === index">
            <span class="checkmark">✓</span>
          </div>
        </div>
      </div>
      <div v-if="errors.correctAnswer" class="error-message">{{ errors.correctAnswer }}</div>
    </div>

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
        :isLoading="questionStore.isLoading"
      >
        {{ editingQuestion ? 'Сұрақты жаңарту' : 'Сұрақ құру' }}
      </BaseButton>
    </div>

    <!-- Preview Section -->
    <div class="form-section preview-section" v-if="showPreview">
      <h3>Алдын ала қарау</h3>
      <div class="preview-content">
        <div class="preview-question">
          <strong>Сұрақ:</strong> {{ form.question || '[Сұрақ мәтіні]' }}
        </div>
        <div class="preview-options">
          <div
            v-for="(option, index) in form.options"
            :key="index"
            class="preview-option"
          >
            <span class="option-letter">{{ String.fromCharCode(65 + index) }}</span>
            <span class="option-text">{{ option || `[${String.fromCharCode(65 + index)} нұсқасы]` }}</span>
            <span v-if="form.correctAnswer === index" class="correct-indicator">✓ Дұрыс</span>
          </div>
        </div>
        <div class="preview-explanation" v-if="form.explanation">
          <strong>Түсіндірме:</strong> {{ form.explanation }}
        </div>
      </div>
    </div>
  </form>
</template>

<script>
import { reactive, onMounted, watch } from 'vue'
import { useQuestionStore } from '../../stores/questions'
import { QUIZ_CATEGORIES } from '../../utils/constants'
import { validateQuestion } from '../../utils/validators'
import BaseButton from '../common/BaseButton.vue'

export default {
  name: 'QuestionForm',
  components: {
    BaseButton
  },
  props: {
    question: {
      type: Object,
      default: null
    }
  },
  emits: ['saved', 'cancel'],
  setup(props, { emit }) {
    const questionStore = useQuestionStore()

    const form = reactive({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: undefined,
      category: '',
      difficulty: '',
      explanation: ''
    })

    const errors = reactive({})
    const showPreview = ref(false)

    const categories = QUIZ_CATEGORIES
    const editingQuestion = !!props.question

    const initializeForm = () => {
      if (props.question) {
        form.question = props.question.question
        form.options = [...props.question.options]
        form.correctAnswer = props.question.correctAnswer
        form.category = props.question.category
        form.difficulty = props.question.difficulty
        form.explanation = props.question.explanation || ''
      }
    }

    const addOption = () => {
      if (form.options.length < 6) {
        form.options.push('')
      }
    }

    const removeOption = (index) => {
      if (form.options.length > 2) {
        form.options.splice(index, 1)
        
        // Adjust correct answer if needed
        if (form.correctAnswer === index) {
          form.correctAnswer = undefined
        } else if (form.correctAnswer > index) {
          form.correctAnswer--
        }
      }
    }

    const validateForm = () => {
      const validation = validateQuestion(form)
      Object.assign(errors, validation.errors)
      return validation.isValid
    }

    const handleSubmit = async () => {
      if (!validateForm()) return

      try {
        if (editingQuestion) {
          await questionStore.updateQuestion(props.question.id, form)
        } else {
          await questionStore.createQuestion(form)
        }
        
        emit('saved')
      } catch (error) {
        console.error('Сұрақты сақтау қатесі:', error)
      }
    }

    // Auto-show preview when form has content
    watch(() => form, (newForm) => {
      if (newForm.question && newForm.options.some(opt => opt.trim())) {
        showPreview.value = true
      }
    }, { deep: true })

    onMounted(() => {
      initializeForm()
    })

    return {
      form,
      errors,
      categories,
      editingQuestion,
      showPreview,
      questionStore,
      addOption,
      removeOption,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.question-form {
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
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.error,
.form-textarea.error,
.form-select.error {
  border-color: var(--error-500);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.error-message {
  color: var(--error-500);
  font-size: var(--text-sm);
  margin-top: var(--space-1);
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.option-row {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.option-input-group {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.option-marker {
  width: 32px;
  height: 32px;
  border: 2px solid var(--gray-300);
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: var(--gray-700);
  flex-shrink: 0;
  background: white;
}

.remove-option-btn {
  background: var(--error-500);
  color: white;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: var(--radius);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-lg);
  transition: var(--transition);
  flex-shrink: 0;
}

.remove-option-btn:hover:not(:disabled) {
  background: var(--error-600);
  transform: scale(1.1);
}

.remove-option-btn:disabled {
  background: var(--gray-400);
  cursor: not-allowed;
  transform: none;
}

.add-option-btn {
  margin-bottom: var(--space-3);
}

.button-icon {
  font-weight: bold;
}

.options-info {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-sm);
  color: var(--gray-600);
}

.info-text {
  background: var(--gray-200);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius);
}

.correct-answer-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-3);
}

.answer-option {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border: 2px solid var(--gray-200);
  border-radius: var(--radius);
  cursor: pointer;
  transition: var(--transition);
  background: white;
  position: relative;
}

.answer-option:hover {
  border-color: var(--primary-300);
  transform: translateY(-1px);
}

.answer-option.selected {
  border-color: var(--primary-500);
  background: var(--primary-50);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}

.answer-option.selected .option-marker {
  background: var(--primary-500);
  border-color: var(--primary-500);
  color: white;
}

.option-text {
  font-weight: 500;
  color: var(--gray-700);
  flex: 1;
}

.answer-option.selected .option-text {
  color: var(--primary-700);
  font-weight: 600;
}

.selection-indicator {
  color: var(--primary-500);
  font-weight: bold;
}

.checkmark {
  font-size: var(--text-lg);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding-top: var(--space-4);
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

.preview-question {
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--gray-200);
  font-size: var(--text-lg);
  color: var(--gray-800);
}

.preview-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.preview-option {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius);
  background: var(--gray-50);
}

.preview-option .option-letter {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--gray-300);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: var(--text-xs);
  flex-shrink: 0;
}

.correct-indicator {
  color: var(--success-600);
  font-weight: 600;
  font-size: var(--text-sm);
  margin-left: auto;
}

.preview-explanation {
  padding-top: var(--space-4);
  border-top: 1px solid var(--gray-200);
  color: var(--gray-700);
  font-size: var(--text-sm);
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .correct-answer-selector {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .options-info {
    flex-direction: column;
    gap: var(--space-2);
  }
  
  .option-input-group {
    gap: var(--space-2);
  }
}
</style>