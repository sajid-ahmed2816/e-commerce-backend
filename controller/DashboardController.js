const moment = require("moment");
const UserModel = require("../models/UserModel");
const OrderModel = require("../models/OrderModel");
const ProductModel = require("../models/ProductModel");
const { SendResponse } = require("../helper/SendResponse");

const getDashboardStats = async (req, res) => {
	try {
		// ===== TOTAL COUNTS =====
		const [totalUsers, totalOrders, totalProducts] = await Promise.all([
			UserModel.countDocuments(),
			OrderModel.countDocuments(),
			ProductModel.countDocuments(),
		]);

		// ===== TOTAL REVENUE =====
		const revenueResult = await OrderModel.aggregate([
			{
				$group: {
					_id: null,
					totalRevenue: { $sum: "$totalAmount" },
				},
			},
		]);

		const totalRevenue = revenueResult[0]?.totalRevenue || 0;

		// ===== MONTHLY AGGREGATION (LAST 12 MONTHS) =====
		const monthlyData = await OrderModel.aggregate([
			{
				$match: {
					createdAt: {
						$gte: moment().startOf("year").toDate(),
						$lte: moment().endOf("year").toDate(),
					},
				},
			},
			{
				$group: {
					_id: {
						month: { $month: "$createdAt" },
					},
					orders: { $sum: 1 },
					revenue: { $sum: "$totalAmount" },
				},
			},
			{ $sort: { "_id.year": 1, "_id.month": 1 } },
		]);

		// ===== USERS MONTHLY =====
		const monthlyUsersData = await UserModel.aggregate([
			{
				$match: {
					createdAt: {
						$gte: moment().startOf("year").toDate(),
						$lte: moment().endOf("year").toDate(),
					},
				},
			},
			{
				$group: {
					_id: {
						month: { $month: "$createdAt" },
					},
					users: { $sum: 1 },
				},
			},
			{ $sort: { "_id.year": 1, "_id.month": 1 } },
		]);

		// ===== FORMAT MONTHS PROPERLY =====
		const months = [
			"Jan", "Feb", "Mar", "Apr", "May", "Jun",
			"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
		];

		const formattedChart = [];

		for (let month = 1; month <= 12; month++) {
			const orderData = monthlyData.find(
				(item) => item._id.month === month
			);

			const userData = monthlyUsersData.find(
				(item) => item._id.month === month
			);

			formattedChart.push({
				month: months[month - 1],
				orders: orderData?.orders || 0,
				revenue: orderData?.revenue || 0,
				users: userData?.users || 0,
			});
		};

		return res.status(200).send(SendResponse(
			true,
			{
				totalUsers,
				totalOrders,
				totalProducts,
				totalRevenue,
				chart: formattedChart
			},
			"Dashboard stats fetched successfully",
			null
		));
	} catch (error) {
		return res.status(500).send(SendResponse(false, null, "Internal Server Error", error.message));
	};
};

module.exports = { getDashboardStats };