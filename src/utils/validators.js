export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password) => {
  return password && password.length >= 6
}

export const validateName = (name) => {
  return name && name.trim().length >= 2
}

export const validateQuestion = (question) => {
  const errors = {}
  
  if (!question.question?.trim()) {
    errors.question = 'Сұрақ мәтіні міндетті'
  }
  
  if (!question.options || question.options.length < 2) {
    errors.options = 'Кемінде 2 нұсқа болуы керек'
  } else if (question.options.some(opt => !opt.trim())) {
    errors.options = 'Барлық нұсқаларда мәтін болуы керек'
  }
  
  if (question.correctAnswer === undefined || question.correctAnswer === null) {
    errors.correctAnswer = 'Дұрыс жауапты таңдау керек'
  }
  
  if (!question.category?.trim()) {
    errors.category = 'Санат міндетті'
  }
  
  if (!question.difficulty) {
    errors.difficulty = 'Қиындық деңгейі міндетті'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const validateQuiz = (quiz) => {
  const errors = {}
  
  if (!quiz.title?.trim()) {
    errors.title = 'Тест атауы міндетті'
  }
  
  if (!quiz.category?.trim()) {
    errors.category = 'Санат міндетті'
  }
  
  if (!quiz.duration || quiz.duration < 60) {
    errors.duration = 'Уақыт кемінде 60 секунд болуы керек'
  }
  
  if (!quiz.questions || quiz.questions.length === 0) {
    errors.questions = 'Кемінде бір сұрақ қосу керек'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const validateUser = (user) => {
  const errors = {}
  
  if (!validateName(user.name)) {
    errors.name = 'Аты-жөні кемінде 2 таңбадан тұруы керек'
  }
  
  if (!validateEmail(user.email)) {
    errors.email = 'Жарамды email енгізіңіз'
  }
  
  if (!validatePassword(user.password)) {
    errors.password = 'Құпия сөз кемінде 6 таңбадан тұруы керек'
  }
  
  if (user.confirmPassword && user.password !== user.confirmPassword) {
    errors.confirmPassword = 'Құпия сөздер сәйкес келмейді'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}