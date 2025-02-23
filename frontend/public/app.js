const backendUrl = process.env.BACKEND_URL;

// Функция для проверки здоровья бэкенда
async function checkBackendHealth() {
  try {
    const response = await fetch(`${backendUrl}/api/health`);
    if (response.ok) {
      const result = await response.json();
      console.log('Backend health check:', result.message);
    } else {
      console.error('Ошибка при проверке здоровья бэкенда:', response.status);
    }
  } catch (error) {
    console.error('Ошибка при проверке здоровья бэкенда:', error);
  }
}

// Запуск проверки здоровья бэкенда каждые 10 секунд
setInterval(checkBackendHealth, 10000);

// Функция для отправки запросов с обработкой ошибок и отладкой
async function sendRequest(url, data) {
  try {
    console.log('Отправка данных на:', url);
    console.log('Данные:', data);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    const result = await response.json();
    console.log('Ответ от сервера:', result);
    return result;
  } catch (error) {
    console.error('Ошибка при отправке запроса:', error);
    return { message: 'Ошибка связи с сервером. Пожалуйста, попробуйте позже.' };
  }
}

// Обработка формы регистрации
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = {
    username: formData.get('username'),
    password: formData.get('password')
  };
  const res = await sendRequest(`${backendUrl}/api/register`, data);
  document.getElementById('message').innerText = res.message;
});

// Обработка формы логина
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = {
    username: formData.get('username'),
    password: formData.get('password')
  };
  const res = await sendRequest(`${backendUrl}/api/login`, data);
  if (res.message === 'Логин успешен') {
    // Скрываем формы авторизации и показываем основное приложение
    document.getElementById('auth').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    document.getElementById('displayUsername').innerText = data.username;
    document.getElementById('counterValue').innerText = res.counter;
    // Сохраним username в localStorage для запросов к API
    localStorage.setItem('username', data.username);
  } else {
    document.getElementById('message').innerText = res.message;
  }
});

// Обработка кнопки "Крути барабань"
document.getElementById('incrementBtn').addEventListener('click', async () => {
  const username = localStorage.getItem('username');
  const res = await sendRequest(`${backendUrl}/api/increment`, { username });
  if (res.counter !== undefined) {
    document.getElementById('counterValue').innerText = res.counter;
  } else {
    document.getElementById('message').innerText = res.message;
  }
});