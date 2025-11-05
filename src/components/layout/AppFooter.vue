<template>
  <footer class="app-footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <div class="logo">
            <div class="logo-icon">Э</div>
            <span class="logo-text">Экономика Модуль</span>
          </div>
          <p class="footer-description">
            Заманауи тест платформасы. Біліміңізді сынап, жетістіктеріңізді бақылаңыз.
          </p>
          <div class="social-links">
            <a href="#" class="social-link" aria-label="Facebook">📘</a>
            <a href="#" class="social-link" aria-label="Twitter">🐦</a>
            <a href="#" class="social-link" aria-label="Instagram">📷</a>
          </div>
        </div>
        
        <div class="footer-section">
          <h4>Жылдам сілтемелер</h4>
          <router-link to="/" class="footer-link">Басты бет</router-link>
          <router-link to="/quizzes" class="footer-link">Тесттер</router-link>
          <router-link to="/results" class="footer-link">Нәтижелер</router-link>
          <router-link to="/admin" class="footer-link" v-if="authStore.isAdmin">Әкімші</router-link>
        </div>
        
        <div class="footer-section">
          <h4>Қолдау көрсету</h4>
          <a href="#" class="footer-link">Көмек орталығы</a>
          <a href="#" class="footer-link">Байланыс</a>
          <a href="#" class="footer-link">Құпиялылық саясаты</a>
          <a href="#" class="footer-link">Пайдалану шарттары</a>
        </div>

        <div class="footer-section">
          <h4>Байланыс ақпараты</h4>
          <div class="contact-info">
            <div class="contact-item">
              <span class="contact-icon">📧</span>
              <span>support@economics-module.kz</span>
            </div>
            <div class="contact-item">
              <span class="contact-icon">📞</span>
              <span>+7 (777) 123-45-67</span>
            </div>
            <div class="contact-item">
              <span class="contact-icon">📍</span>
              <span>Астана, Қазақстан</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; 2024 Экономика Модуль. Барлық құқықтар қорғалған.</p>
        <div class="footer-bottom-links">
          <a href="#" class="footer-link">Құпиялылық</a>
          <a href="#" class="footer-link">Шарттар</a>
          <a href="#" class="footer-link">Карта сайта</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import { useAuthStore } from '../../stores/auth'

export default {
  name: 'AppFooter',
  setup() {
    const authStore = useAuthStore()
    
    return {
      authStore
    }
  }
}
</script>

<style scoped>
.app-footer {
  background: var(--gray-800);
  color: white;
  padding: var(--space-8) 0 var(--space-4);
  margin-top: auto;
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: var(--space-8);
  margin-bottom: var(--space-8);
}

.footer-section h4 {
  margin-bottom: var(--space-4);
  color: white;
  font-size: var(--text-lg);
  font-weight: 600;
}

.footer-description {
  color: var(--gray-300);
  line-height: 1.6;
  margin: var(--space-3) 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-weight: bold;
  font-size: var(--text-xl);
  margin-bottom: var(--space-2);
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

.social-links {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-4);
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--gray-700);
  border-radius: var(--radius);
  text-decoration: none;
  transition: var(--transition);
  font-size: var(--text-lg);
}

.social-link:hover {
  background: var(--primary-500);
  transform: translateY(-2px);
}

.footer-link {
  display: block;
  color: var(--gray-300);
  text-decoration: none;
  margin-bottom: var(--space-2);
  transition: var(--transition);
  padding: var(--space-1) 0;
}

.footer-link:hover {
  color: var(--primary-300);
  transform: translateX(4px);
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.contact-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--gray-300);
}

.contact-icon {
  font-size: var(--text-lg);
  width: 20px;
  text-align: center;
}

.footer-bottom {
  border-top: 1px solid var(--gray-700);
  padding-top: var(--space-4);
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--gray-400);
  font-size: var(--text-sm);
}

.footer-bottom-links {
  display: flex;
  gap: var(--space-4);
}

.footer-bottom-links .footer-link {
  margin-bottom: 0;
  font-size: var(--text-sm);
}

@media (max-width: 1024px) {
  .footer-content {
    grid-template-columns: 1fr 1fr;
    gap: var(--space-6);
  }
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }
  
  .footer-bottom {
    flex-direction: column;
    gap: var(--space-3);
    text-align: center;
  }
  
  .footer-bottom-links {
    justify-content: center;
  }
}
</style>