WHERE NOT EXISTS (
        //     SELECT 1 FROM PHIEUTRAPHONG ptr 
        //     WHERE ptr.MaPhieuDatCoc = pdc.MaPhieuDatCoc
        // )
        // AND NOT EXISTS (
        //     SELECT 1 FROM HOADON hdoa
        //     JOIN PHIEUTRAPHONG ptr ON hdoa.MaPhieuTra = ptr.MaPhieuTra
        //     WHERE ptr.MaPhieuDatCoc = pdc.MaPhieuDatCoc
        // )
        // ORDER BY hd.NgayKetThuc DESC