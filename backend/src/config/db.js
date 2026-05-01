const mssql = require('mssql/msnodesqlv8');
require('dotenv').config();

const server = process.env.DB_SERVER || 'localhost';
const database = process.env.DB_DATABASE || 'QUANLYKHACHSAN';

const connectionString = `Driver={SQL Server};Server=${server};Database=${database};Trusted_Connection=Yes;`;

const config = {
    connectionString: connectionString
};

const poolPromise = new mssql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Kết nối Database thành công (Windows Auth)!');
        return pool;
    })
    .catch(err => {
        console.log(' Lỗi kết nối Database:', err.message);
    });

module.exports = { mssql, poolPromise }; 