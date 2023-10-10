// const bcrypt = require("bcrypt");
// const UserModel = require("../models/UserModel");
// const SendResponse = require("../helper/SendResponse");
// const jwt = require("jsonwebtoken");

// const AuthController = {
//   login: async (req, res) => {
//     const { email, password } = req.body;
//     const obj = { email, password };
// 		let hashPassword = await bcrypt.hash(obj.password, 10);
// 		obj.password = hashPassword;
//     let result = await UserModel.create(obj)

//   },
// };

// module.exports = AuthController;
