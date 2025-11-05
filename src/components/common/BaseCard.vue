<template>
  <div :class="['base-card', { hoverable, padding, flat }]">
    <div class="card-header" v-if="$slots.header || title">
      <slot name="header">
        <h3 v-if="title" class="card-title">{{ title }}</h3>
      </slot>
    </div>
    
    <div class="card-content">
      <slot />
    </div>
    
    <div class="card-footer" v-if="$slots.footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseCard',
  props: {
    title: {
      type: String,
      default: ''
    },
    hoverable: {
      type: Boolean,
      default: false
    },
    padding: {
      type: Boolean,
      default: true
    },
    flat: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.base-card {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  transition: var(--transition);
  border: 1px solid var(--gray-200);
}

.base-card.flat {
  box-shadow: none;
  border: 1px solid var(--gray-200);
}

.base-card.hoverable:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.base-card.padding .card-header,
.base-card.padding .card-content,
.base-card.padding .card-footer {
  padding: var(--space-6);
}

.base-card:not(.padding) .card-header,
.base-card:not(.padding) .card-content,
.base-card:not(.padding) .card-footer {
  padding: 0;
}

.card-header {
  border-bottom: 1px solid var(--gray-200);
  padding-bottom: var(--space-4);
}

.card-title {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--gray-900);
  margin: 0;
}

.card-content {
  color: var(--gray-700);
}

.card-footer {
  border-top: 1px solid var(--gray-200);
  padding-top: var(--space-4);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}
</style>