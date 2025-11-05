<template>
  <header class="app-header">
    <div class="container">
      <div class="header-content">
        <router-link to="/" class="logo">
          <div class="logo-icon">Э</div>
          <span class="logo-text">Экономика Модуль</span>
        </router-link>
        
        <nav class="nav" v-if="authStore.isAuthenticated">
          <router-link to="/" class="nav-link">Басты бет</router-link>
          <router-link to="/quizzes" class="nav-link">Тесттер</router-link>
          <router-link to="/results" class="nav-link" v-if="authStore.isStudent">Нәтижелер</router-link>
          <router-link to="/admin" class="nav-link" v-if="authStore.isAdmin">Әкімші</router-link>
        </nav>
        
        <div class="user-section" v-if="authStore.isAuthenticated">
          <span class="user-name">Сәлем, {{ authStore.userName }}</span>
          <div class="user-role" :class="authStore.userRole">
            {{ roleText }}
          </div>
          <button @click="logout" class="logout-btn">Шығу</button>
        </div>
        
        <div class="auth-section" v-else>
          <router-link to="/login" class="auth-link">Кіру</router-link>
          <router-link to="/register" class="auth-link primary">Тіркелу</router-link>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { useAuthStore } from '../../stores/auth'
import { computed } from 'vue'

export default {
  name: 'AppHeader',
  setup() {
    const authStore = useAuthStore()
    
    const roleText = computed(() => {
      return authStore.isAdmin ? 'Әкімші' : 'Студент'
    })
    
    const logout = () => {
      authStore.logout()
      window.location.href = '/login'
    }
    
    return {
      authStore,
      roleText,
      logout
    }
  }
}
</script>

<style scoped>
.app-header {
  background: white;
  border-bottom: 1px solid var(--gray-200);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  text-decoration: none;
  font-weight: bold;
  font-size: var(--text-xl);
  color: var(--gray-900);
}

.logo-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--primary-500), var(--primary-700));
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

.nav {
  display: flex;
  gap: var(--space-6);
}

.nav-link {
  text-decoration: none;
  color: var(--gray-600);
  font-weight: 500;
  transition: var(--transition);
  padding: var(--space-2) 0;
  position: relative;
}

.nav-link:hover {
  color: var(--primary-600);
}

.nav-link.router-link-active {
  color: var(--primary-600);
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--primary-600);
  border-radius: 1px;
}

.user-section {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.user-name {
  color: var(--gray-700);
  font-weight: 500;
}

.user-role {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
}

.user-role.admin {
  background: var(--primary-100);
  color: var(--primary-700);
}

.user-role.student {
  background: var(--success-100);
  color: var(--success-700);
}

.logout-btn {
  background: var(--gray-100);
  border: 1px solid var(--gray-300);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius);
  color: var(--gray-700);
  cursor: pointer;
  transition: var(--transition);
  font-size: var(--text-sm);
}

.logout-btn:hover {
  background: var(--gray-200);
}

.auth-section {
  display: flex;
  gap: var(--space-3);
}

.auth-link {
  padding: var(--space-2) var(--space-4);
  text-decoration: none;
  border-radius: var(--radius);
  font-weight: 500;
  transition: var(--transition);
  font-size: var(--text-sm);
}

.auth-link:not(.primary) {
  color: var(--gray-600);
  border: 1px solid var(--gray-300);
}

.auth-link:not(.primary):hover {
  background: var(--gray-50);
}

.auth-link.primary {
  background: var(--primary-500);
  color: white;
  border: 1px solid var(--primary-500);
}

.auth-link.primary:hover {
  background: var(--primary-600);
}

@media (max-width: 768px) {
  .nav {
    gap: var(--space-4);
  }
  
  .user-name {
    display: none;
  }
  
  .auth-section {
    gap: var(--space-2);
  }
  
  .auth-link {
    padding: var(--space-2) var(--space-3);
    font-size: var(--text-xs);
  }
}
</style>