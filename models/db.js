const { Pool } = require('pg');

// Настройки подключения к базе данных
const pool = new Pool({
  user: 'postgres',         
  host: 'localhost',            
  database: 'pelmenay',      
  password: '123', 
  port: 5432,                   
});

// Экспортируем пул соединений для использования в других файлах
module.exports = pool;
