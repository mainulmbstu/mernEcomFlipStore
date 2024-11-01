const UserModel = require("../models/userModel");
const OrderModel = require("../models/OrderModel");
const ProductModel = require("../models/productModel");
const CategoryModel = require("../models/CategoryModel");
const GalleryModel = require("../models/GalleryModel");
const { ContactModel, ContactReplyModel } = require("../models/ContactModel");
const mailer = require("../helper/nodeMailer");
const { v4: uuidv4 } = require("uuid");

const {
  uploadOnCloudinary,
  deleteImageOnCloudinary,
} = require("../helper/cloudinary");
//====================================


const orderList = async (req, res) => {
  try {
    let page = req.body.page ? req.body.page : 1;
    let size = req.body.size ? req.body.size : 4;
    let skip = (page - 1) * size;
    // let page = req.query.page ? req.query.page : 1;
    // let size = req.query.size ? req.query.size : 4;
    // let skip = (page - 1) * size;
    await OrderModel.deleteMany({ "payment.status": false });
    const total = await OrderModel.find({}).estimatedDocumentCount();
    const orderList = await OrderModel.find({})
      .populate("user", { password: 0 })
      .skip(skip)
      .limit(size)
      // .populate("products")
      // .populate({
      //   path: "products",
      //   populate: {
      //     path: "category",
      //   },
      // })
      .sort({ createdAt: -1 });

    if (!orderList || orderList.length === 0) {
      return res.status(403).send({ msg: "No data found", orderList, total });
    }
    res.status(200).send({ orderList, total });
  } catch (error) {
    res.status(500).json({ msg: "error from orderList", error });
  }
};

//======================================================
let orderStatusUpdate = async (req, res) => {
  try {
    let oid = req.params.oid;
    let { status } = req.body;
    let order = await OrderModel.findByIdAndUpdate(
      oid,
      { status },
      { new: true }
    );
    if (!order) {
      return res.status(400).send({ msg: "No data found" });
    }
    res.status(200).send({ msg: "order updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "error from update order", error });
  }
};
//=====================================================================
const storeProductList = async (req, res) => {
  try {
    let page = req.query.page ? req.query.page : 1;
    let size = req.query.size ? req.query.size : 4;
    let skip = (page - 1) * size;

    const total = await ProductModel.find({ creator: req?.user?._id });

    const products = await ProductModel.find({creator:req?.user?._id})
      .skip(skip)
      .limit(size)
      .populate("creator", { password: 0 })
      .populate("category")
      .sort({ createdAt: -1 });
    if (!products || products.length === 0) {
      return res.send({ msg: "No data found", products, total });
    }
    res.status(200).send({ products, total:total?.length });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "error from orderList", error });
  }
};

//=============================================

const storeSearchProductList = async (req, res) => {
  try {
    const { keyword } = req.query;
    let page = req.query?.page ? req.query?.page : 1;
    let size = req.query?.size ? req.query?.size : 4;
    let skip = (page - 1) * size;

    const totalSearch = await ProductModel.find({
      $and: [
        { creator: req.user?._id },
        {
          $or: [
            { name: { $regex: keyword, $options: "i" } },
            { description: { $regex: keyword, $options: "i" } },
          ],
        },
      ],
    });
    const searchProduct = await ProductModel.find({
        $and: [ { creator: req.user?._id },
          {$or: [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ]}
        ]
      })
      .populate("category")
      .skip(skip)
      .limit(size);

    res.status(200).send({
      msg: "got user from searchProduct",
      searchProduct,
      total: totalSearch.length,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "error from storeSearchProductList", error });
  }
};

//========================================================

const orderSearch = async (req, res) => {
  try {
    const { keyword } = req.query;
    let page = req.query?.page ? req.query?.page : 1;
    let size = req.query?.size ? req.query?.size : 4;
    let skip = (page - 1) * size;
    const searchUser = await UserModel.find(
      {
        $or: [
          { email: { $regex: keyword, $options: "i" } },
          { phone: { $regex: keyword, $options: "i" } },
        ],
      },
      { name: 1, _id: 1, email: 1 }
    );

    const total = await OrderModel.find({
      $or: [
        { status: { $regex: keyword, $options: "i" } },
        { user: searchUser[0]?._id },
      ],
    });
    const searchOrders = await OrderModel.find({
      $or: [
        { status: { $regex: keyword, $options: "i" } },
        { user: searchUser[0]?._id },
      ],
    })
      .skip(skip)
      .limit(size)
      .populate("user", { password: 0 })
      // .populate("products")
      // .populate({
      //   path: "products",
      //   populate: {
      //     path: "category",
      //   },
      // })
      .sort({ createdAt: -1 });

    res.status(200).send({
      msg: "got orders from search",
      total: total.length,
      searchOrders,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "error from orderSearch", error });
  }
};



//====================================
const adminContacts = async (req, res) => {
  try {
    let page = req.query.page ? req.query.page : 1;
    let size = req.query.size ? req.query.size : 4;
    let skip = (page - 1) * size;
    const total = await ContactModel.find({}).estimatedDocumentCount();

    const contacts = await ContactModel.find({})
      .skip(skip)
      .limit(size)
      .sort({ createdAt: -1 });
    if (!contacts || contacts.length === 0) {
      return res.send({ msg: "No data found" });
    }
    res.status(200).send({ contacts, total });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "error from user list", error });
  }
};

//====================================
const adminContactReply = async (req, res) => {
  try {
    const { email, reply, msgId } = req.body;
    if (!reply || !msgId || !email) {
      return res.json({ msg: "All fields are required" });
    }
    await ContactReplyModel.create({
      email,
      reply,
      msgId,
      user: req.user?._id,
    });
    let findmsg = await ContactModel.findById(msgId);
    let destructure = [...findmsg.replies];
    findmsg.replies = [
      ...destructure,
      { userName: req.user?.name, msg: reply, date: Date.now() },
    ];
    await findmsg.save();

    let credential = {
      email,
      subject: "Contact reply",
      body: `<h2>Hi ${findmsg?.name},</h2>
      <h3>${reply} </h3>
      Thanks for staying with us`,
    };
    mailer(credential);
    res.status(201).json({ msg: "Reply sent successfully", success: true });
  } catch (error) {
    res.status(401).json({ msg: "error from adminContactReply", error });
  }
};

//====================================

const totalSale = async (req, res) => {
  try {
    let sdate = new Date(req.query?.startDate);
    let edate = new Date(req.query?.endDate);

    let todayFull = new Date();
    let todayShort = todayFull.toDateString();
    let today = new Date(todayShort);
    let todayNow = new Date();

    const orders = await OrderModel.find({
      createdAt: { $gte: sdate, $lte: edate },
    });
    const dateTotal = await OrderModel.find({
      createdAt: { $gte: sdate, $lte: edate },
    })
      
      .select({ total: 1, createdAt: 1, products:1 });
    //=====

    // total lisr
    let list = [];
    await orders.map((item) => {
      for (let v of item.products) {
        list.push(v);
      }
    });
    //===== top 5 products
    let result = {};
    await list.map((item) => {
      result[item.name] = (result[item.name] || 0) + item.price;
    });

    let arrTotal = [];
    for (let k in result) {
      await arrTotal.push({ name: k, totalSale: result[k] });
    }
    let topProds = await arrTotal
      .sort((a, b) => {
        return b.totalSale - a.totalSale;
      })
      .slice(0, 5);
    //==============
    
    const ordersToday = await OrderModel.find({
      createdAt: { $gte: today, $lte: todayNow },
    });
    let totalSaleToday =
    ordersToday?.length &&
    ordersToday.reduce((previous, current) => {
      return previous + current.total;
      }, 0);
      
      let totalSale =
      orders?.length &&
      orders.reduce((previous, current) => previous + current.total, 0);

      if (!totalSale || totalSale?.length === 0) {
        return res.send({ msg: "No data found" });
      }
    res
      .status(200)
      .send({ dateTotal, topProds, totalSaleToday, totalSale, success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "error from totalSale", error });
  }
};

//=============================================================
let createCategories = async (category, parentId = null) => {
  let categoryList = [];
  let filteredCat;
  if (parentId == null) {
    filteredCat = await category.filter((item) => item.parentId == undefined);
  } else {
    filteredCat = await category.filter((item) => item.parentId == parentId);
  }
  for (let v of filteredCat) {
    await categoryList.push({
      _id: v._id,
      name: v.name,
      slug: v.slug,
      user: v.user,
      picture: v.picture,
      parentId: v.parentId,
      updatedAt: v.updatedAt,
      children: await createCategories(category, v._id),
    });
  }
  return categoryList;
};

let getPlainCatList = (filtered, list = []) => {
  for (let v of filtered) {
    list.push(v);
    if (v.children.length > 0) {
      getPlainCatList(v.children, list);
    }
  }
  return list;
};

const productByCategory = async (req, res) => {
  try {
    const { page, size, catSlug } = req.body;
    let skip = (page - 1) * size;
    let keyCat = await CategoryModel.findOne({ slug: catSlug });
    const category = await CategoryModel.find({});
    let categoryList = await createCategories(category); // function above
    let filtered = await categoryList.filter(
      (parent) => parent?.slug === req.params?.slug
    );

    let catPlain = getPlainCatList(filtered);

    const category2 = await CategoryModel.find({
      $or: [{ _id: keyCat?._id }, { parentId: keyCat?._id }],
    });
    let finalCat = keyCat?.parentId ? category2 : catPlain;

    let args = {};
    if (finalCat?.length > 0) args.category = finalCat;

    const total = await ProductModel.find({
      $and: [{ creator: req.user?._id }, args],
    });
    
    const products = await ProductModel.find({
      $and: [ { creator: req.user?._id }, args],
    })
      .skip(skip)
      .limit(size)
      .populate("category", "name")
      .sort({ updatedAt: -1 });

    res.status(200).send({ products, total: total?.length });
  } catch (error) {
    console.log(error);
    res.send({ msg: "error from productByCategory", error });
  }
};


module.exports = {
  orderList,
  orderStatusUpdate,
  storeProductList,
  orderSearch,
  storeSearchProductList,
  adminContacts,
  adminContactReply,
  totalSale,
  productByCategory,
};
