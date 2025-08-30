const { SendResponse } = require("../helper/SendResponse");
const BlogModel = require("../models/BlogModel");

const Blogs = async (req, res) => {
  try {
    let result = await BlogModel.find();
    if (result) {
      res.send(SendResponse(true, { blogs: result }, "All Blogs")).status(200);
    }
  } catch (err) {
    res.send(SendResponse(null, null, "Internal server error").status(500));
  }
};

const CreateBlog = async (req, res) => {
  let { name, type, image, content, date } = req.body;
  let obj = { name, type, image, content, date };
  let reqArr = ["name", "type", "image", "content", "date"];
  let errArr = [];

  reqArr.forEach((item) => {
    if (!obj[item]) {
      errArr.push(item);
    }
  });

  if (errArr.length > 0) {
    res.status(400).send(SendResponse(false, null, `Required all data`));
  }

  try {
    const result = new BlogModel(obj);
    await result.save();
    if (!result) {
      res.status(400).send(SendResponse(false, null, "Internal error"));
    } else {
      res.status(200).send(SendResponse(true, result, "Created Successfully"));
    }
  } catch (error) {
    console.log(error);
  }
};

const EditBlog = async (req, res) => {
  let { id } = req.params;
  let { name, type, image, content, date } = req.body;
  let obj = {
    ...(name && { name }),
    ...(type && { type }),
    ...(image && { image }),
    ...(content && { content }),
    ...(date && { date }),
  };

  if (Object.keys(obj).length === 0) {
    return res.status(400).send(SendResponse(false, null, "Required data to update"));
  }

  try {
    const result = await BlogModel.findByIdAndUpdate(id, obj, { new: true });
    if (!result) {
      res.status(404).send(SendResponse(false, null, "Blog not found"));
    } else {
      res.status(200).send(SendResponse(true, result, "Updated Successfully"));
    }
  } catch (error) {
    console.log(error);
  }
};

const DeleteBlog = async (req, res) => {
  const { id } = req.params;
  try {
    let result = await BlogModel.findOneAndDelete(id);
    if (!result) {
      res.send(SendResponse(false, null, "Blog not found")).status(404);
    } else {
      res.send(SendResponse(true, null, "Deleted successfully")).status(200);
    }
  } catch (err) {
    res.send(SendResponse(false, null, "Internal server error")).status(500);
  }
}

module.exports = { Blogs, CreateBlog, EditBlog, DeleteBlog };
