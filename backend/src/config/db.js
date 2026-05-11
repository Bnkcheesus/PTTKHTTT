const mssql = require('mssql/msnodesqlv8');
require('dotenv').config();

const server = process.env.DB_SERVER || 'localhost';
const database = process.env.DB_DATABASE || 'QUANLYKHACHSAN';

const connectionString = `Driver={SQL Server};Server=${server};Database=${database};Trusted_Connection=Yes;`;

const config = {
    connectionString: connectionString,
    // CẤU HÌNH POOL GIÚP CHỐNG DISCONNECT VÀ CHỜ LÂU HƠN
    pool: {
        max: 10,                  // Số kết nối tối đa
        min: 1,                   // Luôn duy trì ít nhất 1 kết nối sống
        idleTimeoutMillis: 3600000 // 30 phút (đóng kết nối thừa nếu không ai xài sau 30 phút)
    },
    requestTimeout: 3600000       // 30 phút (thời gian tối đa chờ 1 câu lệnh SQL chạy xong)
};

const poolPromise = new mssql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Kết nối Database thành công (Windows Auth)!');
        
        // Cực kỳ quan trọng: Bắt lỗi Pool để Node.js không bị "chết" ngang
        pool.on('error', err => {
            console.error('Lỗi Database Pool (Bị ngắt kết nối):', err);
        });

        return pool;
    })
    .catch(err => {
        console.error('Lỗi kết nối Database ngay từ đầu:', err.message);
    });

module.exports = { mssql, poolPromise };