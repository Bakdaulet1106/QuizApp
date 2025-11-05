<template>
  <div v-if="isOpen" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" :class="size">
      <div class="modal-header">
        <h2 class="modal-title">{{ title }}</h2>
        <button @click="close" class="modal-close">
          &times;
        </button>
      </div>
      
      <div class="modal-content">
        <slot />
      </div>
      
      <div class="modal-footer" v-if="$slots.footer">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large', 'xlarge'].includes(value)
    },
    closeOnOverlay: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:isOpen', 'close'],
  methods: {
    close() {
      this.$emit('update:isOpen', false)
      this.$emit('close')
    },
    
    handleOverlayClick(event) {
      if (this.closeOnOverlay && event.target.classList.contains('modal-overlay')) {
        this.close()
      }
    }
  },
  watch: {
    isOpen(newVal) {
      if (newVal) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-4);
  animation: fade-in 0.2s ease-out;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-container {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  max-width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: modal-appear 0.2s ease-out;
}

@keyframes modal-appear {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Modal sizes */
.small {
  width: 400px;
}

.medium {
  width: 500px;
}

.large {
  width: 600px;
}

.xlarge {
  width: 800px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-6);
  border-bottom: 1px solid var(--gray-200);
}

.modal-title {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--gray-900);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: var(--text-2xl);
  color: var(--gray-500);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius);
  transition: var(--transition);
}

.modal-close:hover {
  background: var(--gray-100);
  color: var(--gray-700);
}

.modal-content {
  padding: var(--space-6);
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: var(--space-6);
  border-top: 1px solid var(--gray-200);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}

@media (max-width: 640px) {
  .modal-container {
    width: 100%;
    margin: var(--space-4);
  }
  
  .modal-overlay {
    padding: var(--space-2);
  }
  
  .modal-header,
  .modal-content,
  .modal-footer {
    padding: var(--space-4);
  }
}
</style>