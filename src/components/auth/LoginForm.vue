<template>
  <BaseCard class="login-form-card">
    <template #header>
      <h2 class="form-title">Жүйеге кіру</h2>
      <p class="form-subtitle">Тіркелгіңізге кіру үшін деректеріңізді енгізіңіз</p>
    </template>

    <form @submit.prevent="handleSubmit" class="login-form">
      <div class="form-group">
        <label for="email" class="form-label">Email</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          class="form-input"
          :class="{ error: errors.email }"
          placeholder="Email енгізіңіз"
          required
          autocomplete="email"
        />
        <div v-if="errors.email" class="error-message">{{ errors.email }}</div>
      </div>

      <div class="form-group">
        <label for="password" class="form-label">Құпия сөз</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          class="form-input"
          :class="{ error: errors.password }"
          placeholder="Құпия сөз енгізіңіз"
          required
          autocomplete="current-password"
        />
        <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
      </div>

      <div class="form-options">
        <label class="checkbox-label">
          <input type="checkbox" v-model="rememberMe" />
          <span class="checkmark"></span>
          Мені есте сақтау
        </label>
        <a href="#" class="forgot-password">Құпия сөзді ұмыттыңыз ба?</a>
      </div>

      <BaseButton
        type="submit"
        variant="primary"
        size="large"
        :isLoading="authStore.isLoading"
        class="submit-button"
      >
        Кіру
      </BaseButton>

      <div v-if="authStore.error" class="alert error">
        {{ authStore.error }}
      </div>
    </form>

    <template #footer>
      <p class="form-footer">
        Тіркелгіңіз жоқ па?
        <router-link to="/register" class="form-link">Тіркелу</router-link>
      </p>
    </template>

    <!-- Тесттік тіркелгілер -->
    <div class="test-accounts">
      <h4>Тесттік тіркелгілер:</h4>
      <div class="account-list">
        <div class="account-item">
          <strong>Әкімші:</strong> galymzhan02@quiz.com / galymzhan02
        </div>
        <div class="account-item">
          <strong>Студент:</strong> bakdaulet11062005@gmail.com / ABBA1106
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { validateEmail } from '../../utils/validators'
import BaseCard from '../common/BaseCard.vue'
import BaseButton from '../common/BaseButton.vue'

export default {
  name: 'LoginForm',
  components: {
    BaseCard,
    BaseButton
  },
  emits: ['success'],
  setup(props, { emit }) {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const form = reactive({
      email: '',
      password: ''
    })
    
    const errors = reactive({})
    const rememberMe = ref(false)

    const validateForm = () => {
      errors.email = ''
      errors.password = ''
      let isValid = true

      if (!form.email) {
        errors.email = 'Email енгізу міндетті'
        isValid = false
      } else if (!validateEmail(form.email)) {
        errors.email = 'Жарамды email енгізіңіз'
        isValid = false
      }

      if (!form.password) {
        errors.password = 'Құпия сөз енгізу міндетті'
        isValid = false
      } else if (form.password.length < 6) {
        errors.password = 'Құпия сөз кемінде 6 таңбадан тұруы керек'
        isValid = false
      }

      return isValid
    }

    const handleSubmit = async () => {
      if (!validateForm()) return

      const result = await authStore.login(form)
      
      if (result.success) {
        if (rememberMe.value) {
          localStorage.setItem('rememberMe', 'true')
        }
        emit('success')
        router.push('/')
      }
    }

    onMounted(() => {
      // Pre-fill test accounts for demo
      if (process.env.NODE_ENV === 'development') {
        form.email = 'bakdaulet11062005@gmail.com'
        form.password = 'ABBA1106'
      }
    })

    return {
      form,
      errors,
      rememberMe,
      authStore,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.login-form-card {
  max-width: 400px;
  margin: 0 auto;
}

.form-title {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--gray-900);
  text-align: center;
  margin-bottom: var(--space-2);
}

.form-subtitle {
  color: var(--gray-600);
  text-align: center;
  margin: 0;
  line-height: 1.5;
}

.login-form {
  margin-top: var(--space-6);
}

.form-group {
  margin-bottom: var(--space-4);
}

.form-label {
  display: block;
  margin-bottom: var(--space-2);
  font-weight: 500;
  color: var(--gray-700);
}

.form-input {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius);
  font-size: var(--text-base);
  transition: var(--transition);
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.error {
  border-color: var(--error-500);
}

.error-message {
  color: var(--error-500);
  font-size: var(--text-sm);
  margin-top: var(--space-1);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
  font-size: var(--text-sm);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  color: var(--gray-700);
}

.checkbox-label input {
  display: none;
}

.checkmark {
  width: 16px;
  height: 16px;
  border: 2px solid var(--gray-300);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.checkbox-label input:checked + .checkmark {
  background: var(--primary-500);
  border-color: var(--primary-500);
}

.checkbox-label input:checked + .checkmark::after {
  content: '✓';
  color: white;
  font-size: var(--text-xs);
  font-weight: bold;
}

.forgot-password {
  color: var(--primary-500);
  text-decoration: none;
  font-weight: 500;
}

.forgot-password:hover {
  text-decoration: underline;
}

.submit-button {
  width: 100%;
  margin-bottom: var(--space-4);
}

.alert {
  padding: var(--space-3);
  border-radius: var(--radius);
  text-align: center;
  margin-bottom: var(--space-4);
  font-weight: 500;
}

.alert.error {
  background-color: #fdf2f2;
  color: var(--error-500);
  border: 1px solid #f8b4b4;
}

.form-footer {
  text-align: center;
  color: var(--gray-600);
  margin: 0;
}

.form-link {
  color: var(--primary-500);
  text-decoration: none;
  font-weight: 500;
  margin-left: var(--space-1);
}

.form-link:hover {
  text-decoration: underline;
}

.test-accounts {
  background: var(--gray-50);
  padding: var(--space-4);
  border-radius: var(--radius);
  margin-top: var(--space-6);
  border: 1px solid var(--gray-200);
}

.test-accounts h4 {
  margin: 0 0 var(--space-2) 0;
  color: var(--gray-700);
  font-size: var(--text-sm);
  font-weight: 600;
}

.account-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.account-item {
  font-size: var(--text-xs);
  color: var(--gray-600);
  line-height: 1.4;
  padding: var(--space-2);
  background: white;
  border-radius: var(--radius-sm);
  border: 1px solid var(--gray-200);
}

.account-item strong {
  color: var(--gray-700);
}

@media (max-width: 768px) {
  .form-options {
    flex-direction: column;
    gap: var(--space-3);
    align-items: flex-start;
  }
  
  .test-accounts {
    padding: var(--space-3);
  }
}
</style>