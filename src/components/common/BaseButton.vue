<template>
  <button 
    :class="['base-button', variant, size, { loading: isLoading, disabled }]"
    :disabled="disabled || isLoading"
    @click="$emit('click', $event)"
  >
    <LoadingSpinner v-if="isLoading" class="button-spinner" />
    <span class="button-content">
      <slot />
    </span>
  </button>
</template>

<script>
import LoadingSpinner from './LoadingSpinner.vue'

export default {
  name: 'BaseButton',
  components: {
    LoadingSpinner
  },
  props: {
    variant: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'secondary', 'outline', 'danger', 'success'].includes(value)
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click']
}
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border: none;
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  text-decoration: none;
  font-family: inherit;
  line-height: 1;
}

.base-button:focus {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}

.base-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Variants */
.primary {
  background: var(--primary-500);
  color: white;
}

.primary:hover:not(:disabled) {
  background: var(--primary-600);
}

.secondary {
  background: var(--gray-100);
  color: var(--gray-700);
}

.secondary:hover:not(:disabled) {
  background: var(--gray-200);
}

.outline {
  background: transparent;
  color: var(--primary-500);
  border: 1px solid var(--primary-500);
}

.outline:hover:not(:disabled) {
  background: var(--primary-50);
}

.danger {
  background: var(--error-500);
  color: white;
}

.danger:hover:not(:disabled) {
  background: var(--error-600);
}

.success {
  background: var(--success-500);
  color: white;
}

.success:hover:not(:disabled) {
  background: var(--success-600);
}

/* Sizes */
.small {
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
}

.medium {
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-base);
}

.large {
  padding: var(--space-4) var(--space-6);
  font-size: var(--text-lg);
}

/* Loading state */
.loading {
  pointer-events: none;
}

.button-spinner {
  width: 16px;
  height: 16px;
}

.button-content {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
</style>