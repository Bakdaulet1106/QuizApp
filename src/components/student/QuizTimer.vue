<template>
  <div :class="['quiz-timer', { 
    warning: timeLeft <= warningThreshold, 
    danger: timeLeft <= dangerThreshold,
    paused: !isActive
  }]">
    <div class="timer-header">
      <span class="timer-icon">⏱️</span>
      <span class="timer-label">Қалған уақыт:</span>
    </div>
    <div class="timer-display">
      <span class="time">{{ formatTime(timeLeft) }}</span>
    </div>
    <div class="timer-progress">
      <div 
        class="progress-bar" 
        :style="{ width: progressPercentage + '%' }"
      ></div>
    </div>
    <div class="timer-actions" v-if="showControls">
      <BaseButton 
        v-if="isActive"
        @click="$emit('pause')"
        variant="outline"
        size="small"
      >
        Тоқтату
      </BaseButton>
      <BaseButton 
        v-else
        @click="$emit('resume')"
        variant="primary"
        size="small"
      >
        Жалғастыру
      </BaseButton>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import BaseButton from '../common/BaseButton.vue'
import { formatTime } from '../../utils/helpers'

export default {
  name: 'QuizTimer',
  components: {
    BaseButton
  },
  props: {
    duration: {
      type: Number,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    showControls: {
      type: Boolean,
      default: false
    },
    warningThreshold: {
      type: Number,
      default: 300 // 5 minutes
    },
    dangerThreshold: {
      type: Number,
      default: 60 // 1 minute
    }
  },
  emits: ['time-up', 'pause', 'resume'],
  setup(props, { emit }) {
    const timeLeft = ref(props.duration)
    const progressPercentage = computed(() => (timeLeft.value / props.duration) * 100)
    let timer = null

    const updateTimer = () => {
      if (timeLeft.value > 0 && props.isActive) {
        timeLeft.value--
        
        // Emit warnings
        if (timeLeft.value === props.warningThreshold) {
          emit('warning', 'warning')
        } else if (timeLeft.value === props.dangerThreshold) {
          emit('warning', 'danger')
        }
        
        if (timeLeft.value === 0) {
          emit('time-up')
        }
      }
    }

    const startTimer = () => {
      if (!timer) {
        timer = setInterval(updateTimer, 1000)
      }
    }

    const stopTimer = () => {
      if (timer) {
        clearInterval(timer)
        timer = null
      }
    }

    const resetTimer = () => {
      stopTimer()
      timeLeft.value = props.duration
      if (props.isActive) {
        startTimer()
      }
    }

    watch(() => props.isActive, (isActive) => {
      if (isActive) {
        startTimer()
      } else {
        stopTimer()
      }
    })

    watch(() => props.duration, (newDuration) => {
      resetTimer()
    })

    onMounted(() => {
      if (props.isActive) {
        startTimer()
      }
    })

    onUnmounted(() => {
      stopTimer()
    })

    return {
      timeLeft,
      progressPercentage,
      formatTime
    }
  }
}
</script>

<style scoped>
.quiz-timer {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  box-shadow: var(--shadow-md);
  border: 2px solid var(--primary-500);
  text-align: center;
  transition: all var(--transition);
  min-width: 200px;
}

.quiz-timer.warning {
  border-color: var(--warning-500);
  background: #fef3c7;
}

.quiz-timer.danger {
  border-color: var(--error-500);
  background: #fee2e2;
  animation: pulse 1s infinite;
}

.quiz-timer.paused {
  border-color: var(--gray-400);
  background: var(--gray-100);
  opacity: 0.8;
}

.timer-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.timer-icon {
  font-size: var(--text-lg);
}

.timer-label {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--gray-700);
}

.timer-display {
  margin-bottom: var(--space-3);
}

.time {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--gray-800);
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
}

.quiz-timer.warning .time {
  color: var(--warning-700);
}

.quiz-timer.danger .time {
  color: var(--error-700);
}

.quiz-timer.paused .time {
  color: var(--gray-600);
}

.timer-progress {
  height: 8px;
  background: var(--gray-200);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: var(--space-3);
}

.progress-bar {
  height: 100%;
  background: var(--primary-500);
  border-radius: 4px;
  transition: width 1s linear, background-color 0.3s ease;
}

.quiz-timer.warning .progress-bar {
  background: var(--warning-500);
}

.quiz-timer.danger .progress-bar {
  background: var(--error-500);
}

.quiz-timer.paused .progress-bar {
  background: var(--gray-400);
}

.timer-actions {
  display: flex;
  justify-content: center;
}

@keyframes pulse {
  0%, 100% { 
    opacity: 1;
    transform: scale(1);
  }
  50% { 
    opacity: 0.8;
    transform: scale(1.02);
  }
}

@media (max-width: 768px) {
  .quiz-timer {
    padding: var(--space-3);
    min-width: auto;
  }
  
  .time {
    font-size: var(--text-xl);
  }
  
  .timer-header {
    flex-direction: column;
    gap: var(--space-1);
  }
}
</style>