const Paginate = require("../helper/Paginate");
const { SendResponse } = require("../helper/SendResponse");
const BlogModel = require("../models/BlogModel");

const Blogs = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    };
    const result = await Paginate({
      model: BlogModel,
      query,
      page,
      limit,
    });
    if (result) {
      return res.status(200).send(SendResponse(
        true,
        {
          blogs: result.data,
          pagination: result.pagination,
        },
        "All Blogs"
      ));
    };
  } catch (err) {
    return res.status(500).send(SendResponse(null, null, "Internal server error", err.message));
  };
};

const CreateBlog = async (req, res) => {
  let { title, date, thumbnail, content, status } = req.body;
  let obj = { title, date, thumbnail, content, status };
  let reqArr = ["title", "date", "thumbnail", "content", "status"];
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
  let { title, slug, thumbnail, content, status } = req.body;
  let obj = {
    ...(title && { title }),
    ...(slug && { slug }),
    ...(thumbnail && { thumbnail }),
    ...(content && { content }),
    ...(status && { status }),
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
};

const UpdateStatus = async (req, res) => {
  let { id } = req.params;
  let { status } = req.body;
  let obj = {
    status: status
  };

  if (Object.keys(obj).length === 0) {
    return res.status(400).send(SendResponse(false, null, "Required data to update"));
  };

  try {
    const result = await BlogModel.findByIdAndUpdate(id, obj, { new: true });
    if (!result) {
      return res.status(404).send(SendResponse(false, null, "Blog not found"));
    } else {
      return res.status(200).send(SendResponse(true, result, "Status Updated Successfully"));
    }
  } catch (error) {
    return res.status(500).send(SendResponse(false, null, "Internal server error", err.message));
  }
};

module.exports = { Blogs, CreateBlog, EditBlog, DeleteBlog, UpdateStatus };
