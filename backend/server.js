const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const app = express();
const port = process.env.PORT;

// Подключение к PostgreSQL через переменные окружения
const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DB
});

// Функция для создания таблицы, если она не существует
const createTableIfNotExists = async () => {
  const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(50) NOT NULL,
    counter INTEGER DEFAULT 0
  );`;

  try {
    await pool.query(createTableQuery);
    console.log('Таблица users готова к использованию');
    return true;
  } catch (err) {
    console.error('Ошибка при создании таблицы:', err);
    return false;
  }
};

const tryCreateTable = async () => {
  const success = await createTableIfNotExists();
  if (!success) {
    setTimeout(tryCreateTable, 5000);
  }
};

tryCreateTable();

// Использование CORS
app.use(cors());

// Middleware для JSON-запросов
app.use(bodyParser.json());

// Маршрут для проверки здоровья
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Backend is healthy' });
});

// Регистрация пользователя
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  console.log('Попытка регистрации:', { username, password });
  if (!username || !password) {
    console.log('Логин и пароль обязательны');
    return res.status(400).json({ message: 'Логин и пароль обязательны' });
  }
  try {
    const exist = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (exist.rows.length > 0) {
      console.log('Пользователь уже существует:', username);
      return res.status(409).json({ message: 'Пользователь уже существует' });
    }
    await pool.query('INSERT INTO users(username, password, counter) VALUES($1, $2, $3)', [username, password, 0]);
    console.log('Регистрация успешна для:', username);
    res.json({ message: 'Регистрация прошла успешно' });
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Логин пользователя
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Попытка логина:', { username, password });
  if (!username || !password) {
    console.log('Логин и пароль обязательны');
    return res.status(400).json({ message: 'Логин и пароль обязательны' });
  }
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password]);
    if (result.rows.length === 0) {
      console.log('Неверные логин или пароль для:', username);
      return res.status(401).json({ message: 'Неверные логин или пароль' });
    }
    console.log('Логин успешен для:', username);
    res.json({ message: 'Логин успешен', counter: result.rows[0].counter });
  } catch (error) {
    console.error('Ошибка при логине:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// API для увеличения счетчика "Крути барабань"
app.post('/api/increment', async (req, res) => {
  const { username } = req.body;
  console.log('Попытка увеличить счетчик для:', username);
  if (!username) {
    console.log('Необходимо указать логин');
    return res.status(400).json({ message: 'Необходимо указать логин' });
  }
  try {
    const result = await pool.query(
      'UPDATE users SET counter = counter + 1 WHERE username = $1 RETURNING counter',
      [username]
    );
    if (result.rows.length === 0) {
      console.log('Пользователь не найден:', username);
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    console.log('Счетчик обновлен для:', username, 'новое значение:', result.rows[0].counter);
    res.json({ message: 'Счетчик обновлен', counter: result.rows[0].counter });
  } catch (error) {
    console.error('Ошибка при обновлении счетчика:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});