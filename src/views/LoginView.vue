<template>
  <div class="login-view">
    <div class="container">
      <div class="login-content">
        <div class="login-hero">
          <div class="hero-content">
            <h1 class="hero-title">Экономика Модуль</h1>
            <p class="hero-subtitle">
              Экономика пәні бойынша біліміңізді сынап, біліктілігіңізді арттырыңыз. 
              Қазіргі заманғы тест платформасы студенттер мен оқытушылар үшін.
            </p>
            <div class="hero-features">
              <div class="feature">
                <div class="feature-icon">🎯</div>
                <div class="feature-content">
                  <h4>Дәл тесттер</h4>
                  <p>Экономиканың әртүрлі салалары бойынша арнайы әзірленген тесттер</p>
                </div>
              </div>
              <div class="feature">
                <div class="feature-icon">📊</div>
                <div class="feature-content">
                  <h4>Толық талдау</h4>
                  <p>Жетістіктеріңізді бақылап, әлсіз жақтарыңызды анықтаңыз</p>
                </div>
              </div>
              <div class="feature">
                <div class="feature-icon">⏱️</div>
                <div class="feature-content">
                  <h4>Уақыт шектеулі</h4>
                  <p>Нақты жағдайға жақын уақыт шектеулі тесттер</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="login-form-container">
          <LoginForm @success="handleLoginSuccess" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import LoginForm from '../components/auth/LoginForm.vue'

export default {
  name: 'LoginView',
  components: {
    LoginForm
  },
  setup() {
    const router = useRouter()

    const handleLoginSuccess = () => {
      router.push('/')
    }

    return {
      handleLoginSuccess
    }
  }
}
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary-50) 0%, var(--gray-50) 100%);
  display: flex;
  align-items: center;
  padding: var(--space-8) 0;
}

.login-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-12);
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.login-hero {
  padding: var(--space-8);
}

.hero-content {
  max-width: 500px;
}

.hero-title {
  font-size: var(--text-4xl);
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: var(--space-4);
  line-height: 1.2;
  background: linear-gradient(135deg, var(--primary-600), var(--primary-800));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: var(--text-lg);
  color: var(--gray-600);
  line-height: 1.6;
  margin-bottom: var(--space-8);
}

.hero-features {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.feature {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  padding: var(--space-4);
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--gray-200);
  transition: var(--transition);
}

.feature:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.feature-icon {
  font-size: var(--text-2xl);
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-100);
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

.feature-content h4 {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: var(--space-1);
}

.feature-content p {
  color: var(--gray-600);
  line-height: 1.5;
  margin: 0;
  font-size: var(--text-sm);
}

.login-form-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--space-4);
}

@media (max-width: 968px) {
  .login-content {
    grid-template-columns: 1fr;
    gap: var(--space-8);
  }
  
  .login-hero {
    text-align: center;
    padding: var(--space-4);
  }
  
  .hero-content {
    max-width: none;
  }
  
  .feature {
    text-align: left;
  }
}

@media (max-width: 640px) {
  .login-view {
    padding: var(--space-4) 0;
  }
  
  .hero-title {
    font-size: var(--text-3xl);
  }
  
  .feature {
    flex-direction: column;
    text-align: center;
    gap: var(--space-3);
  }
  
  .feature-icon {
    align-self: center;
  }
}
</style>