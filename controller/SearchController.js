const BlogModel = require("../models/BlogModel");
const ProductModel = require("../models/ProductModel");
const CategoryModel = require("../models/CategoryModel");
const { SendResponse } = require("../helper/SendResponse");

const Search = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) { return res.send({ success: true, data: [], message: "No term" }); }
    const searchRegex = { $regex: query, $options: "i" };
    const blogQuery = { $or: [{ title: searchRegex }, { content: searchRegex }] };
    const productQuery = { $or: [{ name: searchRegex }, { description: searchRegex }] };
    const categoryQuery = { $or: [{ name: searchRegex }, { type: searchRegex }] };

    const [blogs, products, categories] = await Promise.all([
      BlogModel.find(blogQuery).select("title date content thumbnail status createdAt").lean(),
      ProductModel.find(productQuery).select("name category price image description isFeatured isActive createdAt").populate("category").populate("size").lean(),
      CategoryModel.find(categoryQuery).select("name type image isActive isPopular createdAt").lean()
    ]);

    const combinedResults = [
      ...blogs.map(b => ({ ...b, type: "blog", name: b.title, description: b.content })),
      ...products.map(p => ({ ...p, type: "product", title: p.name })),
      ...categories.map(category => ({
        ...category,
        type: "category",
        title: category.name,
        name: category.name,
        description: `Category: ${category.type}`,
        thumbnail: category.image,
        // Additional category-specific fields
        categoryType: category.type,
        isPopular: category.isPopular,
        isActive: category.isActive
      }))
    ];

    return res.status(200).send(SendResponse(true, { results: combinedResults }, "Search results fetched"));
  } catch (error) {
    console.error("Search Error:", error);
    return res.status(500).send(SendResponse(
      false,
      null,
      "Internal server error",
      error.message
    ));
  }
};

module.exports = { Search };