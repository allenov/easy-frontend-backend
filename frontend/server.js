const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT;

// Для парсинга формы и JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Статические файлы (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
  console.log(`Frontend listening on port ${port}`);
});
