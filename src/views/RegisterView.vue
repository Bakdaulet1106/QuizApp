<template>
  <div class="register-view">
    <div class="container">
      <div class="register-content">
        <div class="register-hero">
          <div class="hero-content">
            <h1 class="hero-title">Экономика Модульге қош келдіңіз</h1>
            <p class="hero-subtitle">
              Тіркелгіңізді құрып, экономика біліміңізді дамыту жолын бастаңыз. 
              Сотендаған тесттер мен толық мониторинг қызметтеріне қол жеткізіңіз.
            </p>
            <div class="benefits">
              <div class="benefit">
                <div class="benefit-icon">🚀</div>
                <div class="benefit-content">
                  <h4>Жылдам бастау</h4>
                  <p>Бірнеше секунд ішінде тіркеліп, тест тапсыра бастаңыз</p>
                </div>
              </div>
              <div class="benefit">
                <div class="benefit-icon">📈</div>
                <div class="benefit-content">
                  <h4>Прогресті бақылау</h4>
                  <p>Жетістіктеріңізді егжей-тегжейлі талдау арқылы бақылаңыз</p>
                </div>
              </div>
              <div class="benefit">
                <div class="benefit-icon">🏆</div>
                <div class="benefit-content">
                  <h4>Жетістіктер</h4>
                  <p>Белгілер мен сертификаттарға ие болып, рейтингте көтеріліңіз</p>
                </div>
              </div>
              <div class="benefit">
                <div class="benefit-icon">👥</div>
                <div class="benefit-content">
                  <h4>Қауымдастық</h4>
                  <p>Басқа студенттермен бәсекелесіп, бірлесіп оқыңыз</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="register-form-container">
          <RegisterForm />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import RegisterForm from '../components/auth/RegisterForm.vue'

export default {
  name: 'RegisterView',
  components: {
    RegisterForm
  }
}
</script>

<style scoped>
.register-view {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary-50) 0%, var(--gray-50) 100%);
  display: flex;
  align-items: center;
  padding: var(--space-8) 0;
}

.register-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-12);
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.register-hero {
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

.benefits {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.benefit {
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

.benefit:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.benefit-icon {
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

.benefit-content h4 {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: var(--space-1);
}

.benefit-content p {
  color: var(--gray-600);
  line-height: 1.5;
  margin: 0;
  font-size: var(--text-sm);
}

.register-form-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--space-4);
}

@media (max-width: 968px) {
  .register-content {
    grid-template-columns: 1fr;
    gap: var(--space-8);
  }
  
  .register-hero {
    text-align: center;
    padding: var(--space-4);
  }
  
  .hero-content {
    max-width: none;
  }
  
  .benefit {
    text-align: left;
  }
}

@media (max-width: 640px) {
  .register-view {
    padding: var(--space-4) 0;
  }
  
  .hero-title {
    font-size: var(--text-3xl);
  }
  
  .benefit {
    flex-direction: column;
    text-align: center;
    gap: var(--space-3);
  }
  
  .benefit-icon {
    align-self: center;
  }
}
</style>