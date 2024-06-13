const { Pool } = require('pg');

// Настройки подключения к базе данных
const pool = new Pool({
  user: 'postgres',         
  host: 'roundhouse.proxy.rlwy.net',            
  database: 'railway',      
  password: 'HvwPhzGfRRCroKzeuKZlCtRtYExXfnXM', 
  port: 37644,                   
});

// Экспортируем пул соединений для использования в других файлах
module.exports = pool;
