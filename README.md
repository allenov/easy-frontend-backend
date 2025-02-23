# easy-frontend-backend

Простой фронтенд и бэкенд для тестирования в Docker.

Для запуска имеется готовый docker-compose файл, с помощью которого можно развернуть фронтенд, бэкенд и PostgreSQL.

```bash
docker-compose up --build -d
```

Вы можете увидеть созданную таблицу пользователей и количество нажатий кнопки.

```bash
docker exec -it postgres psql -U student -d kubestore
```

```sql
SELECT * FROM users;
```
