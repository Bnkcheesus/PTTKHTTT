const authModel = require('../models/authModel');

exports.login = async (req, res) => {
    try {
        console.log("Dữ liệu nhận được:", req.body); // THÊM DÒNG NÀY ĐỂ DEBUG
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ message: 'Vui lòng nhập mã nhân viên' });
        }

        const employee = await authModel.getEmployeeByUsername(username);

        if (!employee || employee.employeeType === 'Other') {
            return res.status(401).json({ message: 'Mã nhân viên không tồn tại hoặc không có quyền truy cập hệ thống' });
        }

        res.json({
            success: true,
            data: {
                MaNV: employee.MaNV,
                TenNV: employee.TenNV,
                employeeType: employee.employeeType // Trả về 'Manager', 'Sales', hoặc 'Accounting'
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Lỗi server: ' + err.message });
    }
};