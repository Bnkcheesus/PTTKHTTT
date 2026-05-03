exports.getPaid = async (req, res) => {
    try {
        const data = await hopDongModel.getPaidDepositsNoContract();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getApproved = async (req, res) => {
    try {
        const data = await hopDongModel.getApprovedDepositsNoContract();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.approve = async (req, res) => {
    try {
        await hopDongModel.approveDeposit(req.params.id);
        res.json({ message: "Thành công" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.reject = async (req, res) => {
    try {
        await hopDongModel.rejectDeposit(req.params.id);
        res.json({ message: "Thành công" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};