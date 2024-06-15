const { Pool } = require('pg');

// Настройки подключения к базе данных
const pool = new Pool({
  user: 'postgres',         
  host: 'viaduct.proxy.rlwy.net',            
  database: 'railway',      
  password: 'VABbgCjkjLffcsYvmgjOYcWeUmolovRb', 
  port: 13266,                   
});

// Экспортируем пул соединений для использования в других файлах
module.exports = pool;
