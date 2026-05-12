const { poolPromise, mssql } = require('../config/db');

const candidateBaseQuery = `
    SELECT
        PKT.MaPhieuKiemTra,
        PTR.MaPhieuTra,
        PDC.MaPhieuDatCoc,
        HD.MaHopDong,
        KH.HoTen,
        PDC.MaPhong,
        PTR.NgayTraPhong,
        HD.NgayBatDau,
        HD.NgayKetThuc,
        PDC.TienCoc,
        ISNULL(PKT.SoDienDung, 0) AS SoDienDung,
        ISNULL(PKT.SoNuocDung, 0) AS SoNuocDung,
        ISNULL(PKT.TienThueNo, 0) AS TienThueNo,
        ISNULL(PKT.TienPhat, 0) AS TienPhat
    FROM PHIEUKIEMTRA PKT
    JOIN PHIEUTRAPHONG PTR ON PTR.MaPhieuTra = PKT.MaPhieuTra
    JOIN PHIEUDATCOC PDC ON PDC.MaPhieuDatCoc = PTR.MaPhieuDatCoc
    JOIN KHACHHANG KH ON KH.MaKH = PDC.MaKH
    LEFT JOIN HOPDONG HD ON HD.MaPhieuDatCoc = PDC.MaPhieuDatCoc
    LEFT JOIN BANGDOISOAT B ON B.MaPhieuTra = PTR.MaPhieuTra
`;

const getReconciliationCandidates = async () => {
    const pool = await poolPromise;
    const result = await pool.request()
        .query(`${candidateBaseQuery} WHERE B.MaBang IS NULL`);
    return result.recordset;
};

const getReconciliationCandidateById = async (maPhieuKiemTra) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('MaPhieuKiemTra', mssql.VarChar(50), maPhieuKiemTra)
        .query(`${candidateBaseQuery} WHERE PKT.MaPhieuKiemTra = @MaPhieuKiemTra`);
    return result.recordset[0];
};

const ensureReconciliationStatusColumn = async (request) => {
    await request.query(`
        IF COL_LENGTH('BANGDOISOAT', 'TrangThai') IS NULL
        BEGIN
            ALTER TABLE BANGDOISOAT
            ADD TrangThai NVARCHAR(50) NOT NULL
                CONSTRAINT DF_BANGDOISOAT_TrangThai DEFAULT N'Chờ duyệt'
        END

        IF COL_LENGTH('BANGDOISOAT', 'TrangThaiThanhLy') IS NULL
        BEGIN
            ALTER TABLE BANGDOISOAT
            ADD TrangThaiThanhLy NVARCHAR(50) NOT NULL
                CONSTRAINT DF_BANGDOISOAT_TrangThaiThanhLy DEFAULT N'Chưa thanh lý'
        END

        IF COL_LENGTH('BANGDOISOAT', 'TrangThaiHoanCoc') IS NULL
        BEGIN
            ALTER TABLE BANGDOISOAT
            ADD TrangThaiHoanCoc NVARCHAR(50) NOT NULL
                CONSTRAINT DF_BANGDOISOAT_TrangThaiHoanCoc DEFAULT N'Chưa gửi'
        END

        IF COL_LENGTH('BANGDOISOAT', 'HinhThucHoanCoc') IS NULL
        BEGIN
            ALTER TABLE BANGDOISOAT
            ADD HinhThucHoanCoc NVARCHAR(50) NULL
        END

        IF COL_LENGTH('BANGDOISOAT', 'NgayDuyetHoanCoc') IS NULL
        BEGIN
            ALTER TABLE BANGDOISOAT
            ADD NgayDuyetHoanCoc DATE NULL
        END
    `);
};

const getCreatedReconciliations = async () => {
    const pool = await poolPromise;
    const request = pool.request();
    await ensureReconciliationStatusColumn(request);

    const result = await pool.request().query(`
        SELECT
            B.MaBang,
            B.TyLeHoanCoc,
            B.SoTienHoanCoc,
            B.TongKhauTru,
            B.MaPhieuTra,
            B.TrangThai,
            KH.HoTen,
            PDC.MaPhong,
            PDC.MaPhieuDatCoc
        FROM BANGDOISOAT B
        JOIN PHIEUTRAPHONG PTR ON PTR.MaPhieuTra = B.MaPhieuTra
        JOIN PHIEUDATCOC PDC ON PDC.MaPhieuDatCoc = PTR.MaPhieuDatCoc
        JOIN KHACHHANG KH ON KH.MaKH = PDC.MaKH
        WHERE B.TrangThai = N'Chờ duyệt'
        ORDER BY B.MaBang DESC
    `);

    return result.recordset;
};

const approveReconciliation = async (maBang) => {
    const pool = await poolPromise;
    const request = pool.request();
    await ensureReconciliationStatusColumn(request);

    const result = await pool.request()
        .input('MaBang', mssql.VarChar(50), maBang)
        .query(`
            UPDATE BANGDOISOAT
            SET TrangThai = N'Đã duyệt'
            WHERE MaBang = @MaBang;

            SELECT MaBang, TrangThai
            FROM BANGDOISOAT
            WHERE MaBang = @MaBang;
        `);

    if (!result.recordset[0]) {
        throw new Error('Không tìm thấy phiếu đối soát cần duyệt.');
    }

    return result.recordset[0];
};

const getAdditionalPaymentReconciliations = async () => {
    const pool = await poolPromise;
    const request = pool.request();
    await ensureReconciliationStatusColumn(request);

    const result = await pool.request().query(`
        SELECT
            B.MaBang,
            B.MaPhieuTra,
            B.SoTienHoanCoc,
            B.TongKhauTru,
            CAST(B.TongKhauTru - B.SoTienHoanCoc AS DECIMAL(18, 2)) AS SoTienCanThanhToan,
            HD.MaHopDong,
            KH.HoTen,
            PDC.MaPhong,
            PDC.MaPhieuDatCoc,
            PTR.NgayTraPhong
        FROM BANGDOISOAT B
        JOIN PHIEUTRAPHONG PTR ON PTR.MaPhieuTra = B.MaPhieuTra
        JOIN PHIEUDATCOC PDC ON PDC.MaPhieuDatCoc = PTR.MaPhieuDatCoc
        JOIN KHACHHANG KH ON KH.MaKH = PDC.MaKH
        LEFT JOIN HOPDONG HD ON HD.MaPhieuDatCoc = PDC.MaPhieuDatCoc
        LEFT JOIN HOADON H ON H.MaPhieuTra = B.MaPhieuTra
            AND H.LoaiHoaDon = N'Thanh toán phát sinh'
        WHERE B.TrangThai = N'Đã duyệt'
            AND B.TongKhauTru > B.SoTienHoanCoc
            AND H.MaHD IS NULL
        ORDER BY B.MaBang DESC
    `);

    return result.recordset;
};

const createAdditionalPaymentInvoice = async (maBang) => {
    const pool = await poolPromise;
    const transaction = new mssql.Transaction(pool);

    try {
        await transaction.begin();

        await ensureReconciliationStatusColumn(transaction.request());

        const detailResult = await transaction.request()
            .input('MaBang', mssql.VarChar(50), maBang)
            .query(`
                SELECT
                    B.MaBang,
                    B.MaPhieuTra,
                    CAST(B.TongKhauTru - B.SoTienHoanCoc AS DECIMAL(18, 2)) AS SoTienCanThanhToan
                FROM BANGDOISOAT B
                WHERE B.MaBang = @MaBang
                    AND B.TrangThai = N'Đã duyệt'
                    AND B.TongKhauTru > B.SoTienHoanCoc
            `);

        const payment = detailResult.recordset[0];
        if (!payment) {
            throw new Error('Không tìm thấy phiếu đối soát đã duyệt cần thanh toán phát sinh.');
        }

        const existingResult = await transaction.request()
            .input('MaPhieuTra', mssql.VarChar(50), payment.MaPhieuTra)
            .query(`
                SELECT COUNT(*) AS Count
                FROM HOADON
                WHERE MaPhieuTra = @MaPhieuTra
                    AND LoaiHoaDon = N'Thanh toán phát sinh'
            `);

        if (existingResult.recordset[0].Count > 0) {
            throw new Error('Phiếu đối soát này đã được thanh toán phát sinh.');
        }

        const nextInvoiceNumber = await getNextNumericId(transaction.request(), 'HOADON', 'MaHD', 'HDON');
        const maHD = `HDON${String(nextInvoiceNumber).padStart(3, '0')}`;
        const ngayThanhToan = new Date().toISOString().slice(0, 10);

        await transaction.request()
            .input('MaHD', mssql.VarChar(50), maHD)
            .input('LoaiHoaDon', mssql.NVarChar(50), 'Thanh toán phát sinh')
            .input('SoTien', mssql.Decimal(18, 2), payment.SoTienCanThanhToan)
            .input('NgayThanhToan', mssql.VarChar(10), ngayThanhToan)
            .input('MaPhieuTra', mssql.VarChar(50), payment.MaPhieuTra)
            .query(`
                INSERT INTO HOADON (MaHD, LoaiHoaDon, SoTien, NgayThanhToan, MaPhieuTra)
                VALUES (@MaHD, @LoaiHoaDon, @SoTien, CONVERT(DATE, @NgayThanhToan, 23), @MaPhieuTra)
            `);

        await transaction.commit();

        return {
            MaHD: maHD,
            MaBang: payment.MaBang,
            MaPhieuTra: payment.MaPhieuTra,
            SoTien: payment.SoTienCanThanhToan,
        };
    } catch (error) {
        try {
            await transaction.rollback();
        } catch (rollbackError) {
            console.error('Rollback failed', rollbackError);
        }
        throw error;
    }
};

const getSalesRefundCandidates = async () => {
    const pool = await poolPromise;
    const request = pool.request();
    await ensureReconciliationStatusColumn(request);

    const result = await pool.request().query(`
        SELECT
            B.MaBang,
            B.MaPhieuTra,
            B.SoTienHoanCoc,
            B.TongKhauTru,
            B.TrangThaiThanhLy,
            B.TrangThaiHoanCoc,
            HD.MaHopDong,
            KH.HoTen,
            PDC.MaPhieuDatCoc,
            PDC.MaPhong,
            PTR.NgayTraPhong,
            H.MaHD AS MaHoaDonPhatSinh
        FROM BANGDOISOAT B
        JOIN PHIEUTRAPHONG PTR ON PTR.MaPhieuTra = B.MaPhieuTra
        JOIN PHIEUDATCOC PDC ON PDC.MaPhieuDatCoc = PTR.MaPhieuDatCoc
        JOIN KHACHHANG KH ON KH.MaKH = PDC.MaKH
        LEFT JOIN HOPDONG HD ON HD.MaPhieuDatCoc = PDC.MaPhieuDatCoc
        LEFT JOIN HOADON H ON H.MaPhieuTra = B.MaPhieuTra
            AND H.LoaiHoaDon = N'Thanh toán phát sinh'
        WHERE B.TrangThai = N'Đã duyệt'
            AND B.TrangThaiHoanCoc = N'Chưa gửi'
            AND (B.TongKhauTru <= B.SoTienHoanCoc OR H.MaHD IS NOT NULL)
        ORDER BY B.MaBang DESC
    `);

    return result.recordset;
};

const liquidateContractForRefund = async (maBang) => {
    const pool = await poolPromise;
    const transaction = new mssql.Transaction(pool);

    try {
        await transaction.begin();
        await ensureReconciliationStatusColumn(transaction.request());

        const detailResult = await transaction.request()
            .input('MaBang', mssql.VarChar(50), maBang)
            .query(`
                SELECT
                    B.MaBang,
                    PTR.MaPhieuDatCoc,
                    PDC.MaPhong
                FROM BANGDOISOAT B
                JOIN PHIEUTRAPHONG PTR ON PTR.MaPhieuTra = B.MaPhieuTra
                JOIN PHIEUDATCOC PDC ON PDC.MaPhieuDatCoc = PTR.MaPhieuDatCoc
                LEFT JOIN HOADON H ON H.MaPhieuTra = B.MaPhieuTra
                    AND H.LoaiHoaDon = N'Thanh toán phát sinh'
                WHERE B.MaBang = @MaBang
                    AND B.TrangThai = N'Đã duyệt'
                    AND B.TrangThaiHoanCoc = N'Chưa gửi'
                    AND (B.TongKhauTru <= B.SoTienHoanCoc OR H.MaHD IS NOT NULL)
            `);

        const item = detailResult.recordset[0];
        if (!item) {
            throw new Error('Không tìm thấy hồ sơ đủ điều kiện thanh lý hợp đồng.');
        }

        await transaction.request()
            .input('MaPhieuDatCoc', mssql.VarChar(50), item.MaPhieuDatCoc)
            .query(`
                UPDATE PHIEUDATCOC
                SET TrangThai = N'Đã thanh lý'
                WHERE MaPhieuDatCoc = @MaPhieuDatCoc
            `);

        if (item.MaPhong) {
            await transaction.request()
                .input('MaPhong', mssql.VarChar(50), item.MaPhong)
                .query(`
                    UPDATE PHONG
                    SET TrangThai = N'Trống'
                    WHERE MaPhong = @MaPhong
                `);
        }

        await transaction.request()
            .input('MaPhieuDatCoc', mssql.VarChar(50), item.MaPhieuDatCoc)
            .query(`
                UPDATE G
                SET G.TrangThai = N'Trống'
                FROM GIUONG G
                JOIN CHITIETDATCOC CT ON CT.MaGiuong = G.MaGiuong
                WHERE CT.MaPhieuDatCoc = @MaPhieuDatCoc
            `);

        await transaction.request()
            .input('MaBang', mssql.VarChar(50), maBang)
            .query(`
                UPDATE BANGDOISOAT
                SET TrangThaiThanhLy = N'Đã thanh lý'
                WHERE MaBang = @MaBang
            `);

        await transaction.commit();

        return { MaBang: maBang, TrangThaiThanhLy: 'Đã thanh lý' };
    } catch (error) {
        try {
            await transaction.rollback();
        } catch (rollbackError) {
            console.error('Rollback failed', rollbackError);
        }
        throw error;
    }
};

const submitRefundRequest = async ({ maBang, hinhThucHoanCoc }) => {
    const pool = await poolPromise;
    const request = pool.request();
    await ensureReconciliationStatusColumn(request);

    const result = await pool.request()
        .input('MaBang', mssql.VarChar(50), maBang)
        .input('HinhThucHoanCoc', mssql.NVarChar(50), hinhThucHoanCoc)
        .query(`
            UPDATE BANGDOISOAT
            SET TrangThaiHoanCoc = N'Chờ kế toán hoàn cọc',
                HinhThucHoanCoc = @HinhThucHoanCoc,
                NgayDuyetHoanCoc = CAST(GETDATE() AS DATE)
            WHERE MaBang = @MaBang
                AND TrangThai = N'Đã duyệt'
                AND TrangThaiThanhLy = N'Đã thanh lý'
                AND TrangThaiHoanCoc = N'Chưa gửi';

            SELECT MaBang, TrangThaiHoanCoc, HinhThucHoanCoc
            FROM BANGDOISOAT
            WHERE MaBang = @MaBang
        `);

    const item = result.recordset[0];
    if (!item || item.TrangThaiHoanCoc !== 'Chờ kế toán hoàn cọc') {
        throw new Error('Hồ sơ phải được thanh lý hợp đồng trước khi gửi hoàn cọc.');
    }

    return item;
};

const getAccountingRefundRequests = async () => {
    const pool = await poolPromise;
    const request = pool.request();
    await ensureReconciliationStatusColumn(request);

    const result = await pool.request().query(`
        SELECT
            B.MaBang,
            B.MaPhieuTra,
            B.SoTienHoanCoc,
            B.TongKhauTru,
            B.HinhThucHoanCoc,
            B.NgayDuyetHoanCoc,
            B.TrangThaiHoanCoc,
            HD.MaHopDong,
            KH.HoTen,
            PDC.MaPhieuDatCoc,
            PDC.MaPhong
        FROM BANGDOISOAT B
        JOIN PHIEUTRAPHONG PTR ON PTR.MaPhieuTra = B.MaPhieuTra
        JOIN PHIEUDATCOC PDC ON PDC.MaPhieuDatCoc = PTR.MaPhieuDatCoc
        JOIN KHACHHANG KH ON KH.MaKH = PDC.MaKH
        LEFT JOIN HOPDONG HD ON HD.MaPhieuDatCoc = PDC.MaPhieuDatCoc
        WHERE B.TrangThaiHoanCoc = N'Chờ kế toán hoàn cọc'
        ORDER BY B.NgayDuyetHoanCoc DESC, B.MaBang DESC
    `);

    return result.recordset;
};

const confirmRefundPayment = async (maBang) => {
    const pool = await poolPromise;
    const request = pool.request();
    await ensureReconciliationStatusColumn(request);

    const result = await pool.request()
        .input('MaBang', mssql.VarChar(50), maBang)
        .query(`
            UPDATE BANGDOISOAT
            SET TrangThaiHoanCoc = N'Đã hoàn cọc'
            WHERE MaBang = @MaBang
                AND TrangThaiHoanCoc = N'Chờ kế toán hoàn cọc';

            SELECT MaBang, TrangThaiHoanCoc
            FROM BANGDOISOAT
            WHERE MaBang = @MaBang
        `);

    const item = result.recordset[0];
    if (!item || item.TrangThaiHoanCoc !== 'Đã hoàn cọc') {
        throw new Error('Không tìm thấy phiếu hoàn cọc cần xác nhận.');
    }

    return item;
};

const parseDateValue = (value) => {
    if (!value) return null;
    return value instanceof Date ? value : new Date(value);
};

const getMonthsBetween = (startDate, endDate) => {
    const start = parseDateValue(startDate);
    const end = parseDateValue(endDate);
    if (!start || !end) return 0;
    return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
};

const calculateRefundRate = (maHopDong, ngayBatDau, ngayKetThuc) => {
    if (!maHopDong) {
        return { ratio: 0.8, reason: 'Không có hợp đồng' };
    }

    const now = new Date();
    const endDate = parseDateValue(ngayKetThuc);
    const startDate = parseDateValue(ngayBatDau);

    if (endDate && endDate < now) {
        return { ratio: 1.0, reason: 'Hợp đồng đã hết hạn' };
    }

    if (startDate && endDate) {
        const months = getMonthsBetween(startDate, endDate);
        if (months >= 6) {
            return { ratio: 0.7, reason: 'Hợp đồng từ 6 tháng trở lên' };
        }
        return { ratio: 0.5, reason: 'Hợp đồng dưới 6 tháng' };
    }

    return { ratio: 0.5, reason: 'Hợp đồng còn hiệu lực' };
};

const getNextNumericId = async (request, table, column, prefix) => {
    const result = await request.query(`
        SELECT MAX(CAST(SUBSTRING(${column}, ${prefix.length + 1}, 10) AS INT)) AS MaxId
        FROM ${table}
        WHERE ${column} LIKE '${prefix}%'
    `);
    return (result.recordset[0]?.MaxId || 0) + 1;
};

const createReconciliation = async ({ maPhieuKiemTra, giaDien, giaNuoc, tienNoKhac }) => {
    const pool = await poolPromise;
    const transaction = new mssql.Transaction(pool);

    try {
        await transaction.begin();

        const txRequest = transaction.request();
        const detailResult = await txRequest
            .input('MaPhieuKiemTra', mssql.VarChar(50), maPhieuKiemTra)
            .query(`${candidateBaseQuery} WHERE PKT.MaPhieuKiemTra = @MaPhieuKiemTra`);

        const inspection = detailResult.recordset[0];
        if (!inspection) {
            throw new Error('Không tìm thấy phiếu kiểm tra đối soát.');
        }

        const existingResult = await transaction.request()
            .input('MaPhieuTra', mssql.VarChar(50), inspection.MaPhieuTra)
            .query('SELECT COUNT(*) AS Count FROM BANGDOISOAT WHERE MaPhieuTra = @MaPhieuTra');

        if (existingResult.recordset[0].Count > 0) {
            throw new Error('Phiếu trả phòng đã được đối soát trước đó.');
        }

        const normalizedGiaDien = Number(giaDien) || 0;
        const normalizedGiaNuoc = Number(giaNuoc) || 0;
        const normalizedTienNoKhac = Number(tienNoKhac) || 0;

        const { ratio, reason } = calculateRefundRate(
            inspection.MaHopDong,
            inspection.NgayBatDau,
            inspection.NgayKetThuc
        );

        const depositAmount = Number(inspection.TienCoc || 0);
        const electricAmount = Number((normalizedGiaDien * Number(inspection.SoDienDung || 0)).toFixed(2));
        const waterAmount = Number((normalizedGiaNuoc * Number(inspection.SoNuocDung || 0)).toFixed(2));
        const thueNoAmount = Number(inspection.TienThueNo || 0);
        const phatAmount = Number(inspection.TienPhat || 0);
        const otherDebt = Number(normalizedTienNoKhac || 0);
        const totalDeductions = Number((electricAmount + waterAmount + thueNoAmount + phatAmount + otherDebt).toFixed(2));
        const refundAmount = Number((depositAmount * ratio).toFixed(2));

        const nextBangNumber = await getNextNumericId(transaction.request(), 'BANGDOISOAT', 'MaBang', 'BDS');
        const maBang = `BDS${String(nextBangNumber).padStart(3, '0')}`;

        await transaction.request()
            .input('MaBang', mssql.VarChar(50), maBang)
            .input('TyLeHoanCoc', mssql.Decimal(18, 2), ratio)
            .input('SoTienHoanCoc', mssql.Decimal(18, 2), refundAmount)
            .input('TongKhauTru', mssql.Decimal(18, 2), totalDeductions)
            .input('MaPhieuTra', mssql.VarChar(50), inspection.MaPhieuTra)
            .query(`
                INSERT INTO BANGDOISOAT (MaBang, TyLeHoanCoc, SoTienHoanCoc, TongKhauTru, MaPhieuTra)
                VALUES (@MaBang, @TyLeHoanCoc, @SoTienHoanCoc, @TongKhauTru, @MaPhieuTra)
            `);

        const deductionItems = [
            { TenKhoan: 'Tiền điện', SoTien: electricAmount },
            { TenKhoan: 'Tiền nước', SoTien: waterAmount },
            { TenKhoan: 'Tiền thuê nợ', SoTien: thueNoAmount },
            { TenKhoan: 'Tiền phạt', SoTien: phatAmount },
            { TenKhoan: 'Nợ khác', SoTien: otherDebt },
        ].filter((item) => item.SoTien > 0);

        let nextKhauTruNumber = await getNextNumericId(transaction.request(), 'CHITIETKHAUTRU', 'MaKhauTru', 'KTR');
        for (const item of deductionItems) {
            const maKhauTru = `KTR${String(nextKhauTruNumber).padStart(3, '0')}`;
            await transaction.request()
                .input('MaKhauTru', mssql.VarChar(50), maKhauTru)
                .input('TenKhoan', mssql.NVarChar(200), item.TenKhoan)
                .input('SoTien', mssql.Decimal(18, 2), item.SoTien)
                .input('MaBang', mssql.VarChar(50), maBang)
                .query(`
                    INSERT INTO CHITIETKHAUTRU (MaKhauTru, TenKhoan, SoTien, MaBang)
                    VALUES (@MaKhauTru, @TenKhoan, @SoTien, @MaBang)
                `);
            nextKhauTruNumber += 1;
        }

        await transaction.commit();

        return {
            MaBang: maBang,
            MaPhieuTra: inspection.MaPhieuTra,
            MaPhieuKiemTra: inspection.MaPhieuKiemTra,
            ratio,
            reason,
            depositAmount,
            refundAmount,
            totalDeductions,
            difference: Number((refundAmount - totalDeductions).toFixed(2)),
            deductionItems,
        };
    } catch (error) {
        try {
            await transaction.rollback();
        } catch (rollbackError) {
            console.error('Rollback failed', rollbackError);
        }
        throw error;
    }
};

module.exports = {
    getReconciliationCandidates,
    getReconciliationCandidateById,
    getCreatedReconciliations,
    approveReconciliation,
    getAdditionalPaymentReconciliations,
    createAdditionalPaymentInvoice,
    getSalesRefundCandidates,
    liquidateContractForRefund,
    submitRefundRequest,
    getAccountingRefundRequests,
    confirmRefundPayment,
    createReconciliation,
};
