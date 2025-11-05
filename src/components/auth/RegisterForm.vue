<template>
  <BaseCard class="auth-form">
    <template #header>
      <h2 class="form-title">Тіркелгі құру</h2>
      <p class="form-subtitle">Жаңа тіркелгіні бастау үшін төмендегі форманы толтырыңыз</p>
    </template>

    <form @submit.prevent="handleSubmit" class="form">
      <div class="form-group">
        <label for="name" class="form-label">Аты-жөні</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          class="form-input"
          :class="{ error: errors.name }"
          placeholder="Аты-жөніңізді енгізіңіз"
          required
          autocomplete="name"
        />
        <div v-if="errors.name" class="error-message">{{ errors.name }}</div>
      </div>

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
          placeholder="Құпия сөз құрыңыз"
          required
          autocomplete="new-password"
        />
        <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
        <div class="password-hint">
          Құпия сөз кемінде 6 таңбадан тұруы керек
        </div>
      </div>

      <div class="form-group">
        <label for="confirmPassword" class="form-label">Құпия сөзді растау</label>
        <input
          id="confirmPassword"
          v-model="form.confirmPassword"
          type="password"
          class="form-input"
          :class="{ error: errors.confirmPassword }"
          placeholder="Құпия сөзді қайта енгізіңіз"
          required
          autocomplete="new-password"
        />
        <div v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</div>
      </div>

      <div class="form-options">
        <label class="checkbox-label">
          <input type="checkbox" v-model="agreeTerms" required />
          <span class="checkmark"></span>
          Мен <a href="#" class="link">Пайдалану шарттарымен</a> келісемін
        </label>
      </div>

      <div v-if="authStore.error" class="alert error">
        {{ authStore.error }}
      </div>

      <BaseButton
        type="submit"
        variant="primary"
        size="large"
        :isLoading="authStore.isLoading"
        class="submit-button"
      >
        Тіркелу
      </BaseButton>
    </form>

    <template #footer>
      <p class="form-footer">
        Тіркелгіңіз бар ма?
        <router-link to="/login" class="form-link">Кіру</router-link>
      </p>
    </template>
  </BaseCard>
</template>

<script>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { validateEmail, validatePassword, validateName } from '../../utils/validators'
import BaseCard from '../common/BaseCard.vue'
import BaseButton from '../common/BaseButton.vue'

export default {
  name: 'RegisterForm',
  components: {
    BaseCard,
    BaseButton
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    const form = reactive({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    })

    const errors = reactive({})
    const agreeTerms = ref(false)

    const validateForm = () => {
      // Clear previous errors
      Object.keys(errors).forEach(key => errors[key] = '')
      let isValid = true

      if (!validateName(form.name)) {
        errors.name = 'Аты-жөні кемінде 2 таңбадан тұруы керек'
        isValid = false
      }

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
      } else if (!validatePassword(form.password)) {
        errors.password = 'Құпия сөз кемінде 6 таңбадан тұруы керек'
        isValid = false
      }

      if (!form.confirmPassword) {
        errors.confirmPassword = 'Құпия сөзді растау міндетті'
        isValid = false
      } else if (form.password !== form.confirmPassword) {
        errors.confirmPassword = 'Құпия сөздер сәйкес келмейді'
        isValid = false
      }

      if (!agreeTerms.value) {
        alert('Пайдалану шарттарымен келісуіңіз керек')
        isValid = false
      }

      return isValid
    }

    const handleSubmit = async () => {
      if (!validateForm()) return

      const result = await authStore.register({
        name: form.name,
        email: form.email,
        password: form.password
      })
      
      if (result.success) {
        router.push('/')
      }
    }

    return {
      form,
      errors,
      agreeTerms,
      authStore,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.auth-form {
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

.form {
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

.password-hint {
  color: var(--gray-500);
  font-size: var(--text-sm);
  margin-top: var(--space-1);
}

.form-options {
  margin-bottom: var(--space-6);
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  cursor: pointer;
  color: var(--gray-700);
  font-size: var(--text-sm);
  line-height: 1.4;
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
  flex-shrink: 0;
  margin-top: 2px;
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

.link {
  color: var(--primary-500);
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
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

.submit-button {
  width: 100%;
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

@media (max-width: 768px) {
  .auth-form {
    margin: var(--space-4);
  }
  
  .checkbox-label {
    font-size: var(--text-xs);
  }
}
</style>