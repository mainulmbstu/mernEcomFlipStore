const {
  uploadOnCloudinary,
  deleteImageOnCloudinary,
} = require("../helper/cloudinary");
const { v4: uuidv4 } = require("uuid");
const ProductModel = require("../models/productModel");
const CategoryModel = require("../models/CategoryModel");
const slugify = require("slugify");
const OrderModel = require("../models/OrderModel");
const { ReviewModel, RatingModel } = require("../models/ReviewModel");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const ejs = require("ejs");
const path = require("path");
const fs = require("fs");
let pdfCreator = require("pdf-creator-node");
const mailer = require("../helper/nodeMailer");

//==================================================
const createProduct = async (req, res) => {
  try {
    let { name, description, category, price, color, offer, quantity } =
      req.body;
    const pictures = req.files;
    if (!name || !description || !category || !price || !quantity) {
      return res.send({ msg: "All fields are required" });
    }
    if (category === "undefined") {
      return res.send({ msg: "Wrong category" });
    }
    let picturePaths =
      (await pictures.length) && pictures.map((pic) => pic.path);

    let links = [];
    for (spath of picturePaths) {
      const { secure_url, public_id } = await uploadOnCloudinary(
        spath,
        "products"
      ); // path and folder name as arguments
      links = [...links, { secure_url, public_id }];
      if (!secure_url) {
        return res
          .status(500)
          .send({ msg: "error uploading image", error: secure_url });
      }
    }
    let cArr = [];
    if (color) {
      cArr = await color.split(",");
    }
    let product = new ProductModel();

    product.name = name.toUpperCase();
    product.slug = slugify(name);
    product.storeName = req.user?.storeName || 'Admin Store';
    product.description = description;
    product.category = category;
    product.price = price;
    if (offer) product.offer = offer;
    if (color) product.color = cArr;
    product.quantity = quantity;
    product.creator = req.user?._id;
    product.picture = links;

    await product.save();

    // let product = await ProductModel.create({
    //   name: name.toUpperCase(),
    //   slug: slugify(name),
    //   description,
    //   category,
    //   price,
    //   offer,
    //   color:color && color,
    //   quantity,
    //   user: req.user?._id,
    //   picture: links,
    // });
    res.status(201).send({
      msg: "product created successfully",
      success: true,
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      msg: "error from product create, check file size and file type",
      error,
    });
  }
};

// //==========single image==============
// const createProduct = async (req, res) => {
//   try {
//     const { name, description, category, price, quantity, shipping } = req.body;
//     // const picture = req.file?.fieldname;
//     const picturePath = req.file?.path
//     if (!name || !description || !category || !price || !quantity) {
//       return res.status(400).send({ msg: "All fields are required" });
//     }

//     const { secure_url, public_id } = await uploadOnCloudinary(
//       picturePath,
//       "products"
//     ); // path and folder name as arguments
//     if (!secure_url) {
//       return res
//         .status(500)
//         .send({ msg: "error uploading image", error: secure_url });
//     }

//     let product = await ProductModel.create({
//       name,
//       slug: slugify(name),
//       description,
//       category,
//       price,
//       quantity,
//       user: req.user?._id,
//       picture: { secure_url, public_id },
//       shipping,
//     });
//     res
//       .status(201)
//       .send({ msg: "product created successfully", success: true, product });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({ msg: "error from product create, check file size and file type", error });
//   }
// };
//======================================
const productList = async (req, res) => {
  try {
    let page = req.query.page ? req.query.page : 1;
    let size = req.query.size ? req.query.size : 4;
    let skip = (page - 1) * size;
    let offerIds = (
      await ProductModel.find({ offer: { $gt: 0 } })
        .sort({ updatedAt: -1 })
        .limit(5)
    ).map((item) => item._id);

    const total = (await ProductModel.find({ _id: { $nin: offerIds } })).length;
    const products = await ProductModel.find({ _id: { $nin: offerIds } })
      .skip(skip)
      .limit(size)
      .populate("category", "name")
      // .populate("category", 'name slug')
      // .populate("category", '-picture')
      .sort({ createdAt: -1 });
    if (!products || products.length === 0) {
      return res.send({ msg: "No data found", products, total });
    }
    res.status(200).send({ products, total });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "error from productList", error });
  }
};
//==============================================
const updateProduct = async (req, res) => {
  try {
    let pid = req.params.pid;
    const { name, description, category, price, offer, quantity, color } = req.body;
    const pictures = req.files;
    if (category === "undefined") {
      return res.send({ msg: "Wrong category" });
    }
    let product = await ProductModel.findById(pid);
    if (!product) {
      return res.send({ msg: "No data found" });
    }
      let cArr = [];
      if (color) {
        cArr = await color.split(",");
      }

    if (name) product.name = name.toUpperCase();
    if (name) product.slug = slugify(name);
    if (description) product.description = description;
    if (category) product.category = category;
    if (price) product.price = price;
    if (offer) product.offer = offer;
    if (quantity) product.quantity = quantity
    product.color = cArr;

    // upload and delete image on cloudinary
    let picturePaths =
      (await pictures.length) && pictures.map((pic) => pic.path);

    let links = [];
    if (picturePaths.length) {
      for (spath of picturePaths) {
        const { secure_url, public_id } = await uploadOnCloudinary(
          spath,
          "products"
        ); // path and folder name as arguments
        links = [...links, { secure_url, public_id }];
        if (!secure_url) {
          return res
            .status(500)
            .send({ msg: "error uploading image", error: secure_url });
        }
      }

      if (product?.picture?.length && product?.picture[0].public_id) {
        let publicPaths = await product.picture.map((pic) => pic.public_id);
        for (dpath of publicPaths) {
          await deleteImageOnCloudinary(dpath);
        }
      }

      product.picture = links;
    }

    let updatedProduct = await product.save();
    res.status(201).send({
      success: true,
      msg: "product updated successfully",
      updatedProduct,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ success: false, msg: "error from product update", error });
  }
};
// const updateProduct = async (req, res) => {
//   try {
//     let pid = req.params.pid;
//     const { name, description, category, price, quantity, shipping } = req.body;
//     // const picture = req.file?.fieldname;
//     const picturePath = req.file?.path;
//     let product = await ProductModel.findById(pid);
//     if (!product) {
//       return res.status(400).send({ msg: "No data found" });
//     }

//     if (name) product.name = name;
//     if (name) product.slug = slugify(name);
//     if (description) product.description = description;
//     if (category) product.category = category;
//     if (price) product.price = price;
//     if (quantity) product.quantity = quantity;
//     if (shipping) product.shipping = shipping;

//     // upload and delete image on cloudinary
//     if (picturePath) {
//       let { secure_url, public_id } = await uploadOnCloudinary(
//         picturePath,
//         "products"
//       );
//       if (product.picture && product.picture.public_id) {
//         await deleteImageOnCloudinary(product.picture.public_id);
//       }

//       product.picture = { secure_url, public_id };
//     }

//     let updatedProduct = await product.save();
//     res.status(201).send({
//       success: true,
//       msg: "product updated successfully, refresh to view",
//       updatedProduct,
//     });
//   } catch (error) {
//     console.log(error);
//     res
//       .status(500)
//       .send({ success: false, msg: "error from product update", error });
//   }
// };
//=========================================

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
    const { page, size, priceCatArr, catSlug } = req.body;
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
    if (priceCatArr?.length > 0)
      args.price = { $gte: priceCatArr[0], $lte: priceCatArr[1] };

    const total = await ProductModel.find(args);
    const products = await ProductModel.find(args)
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
//================================================
const moreInfo = async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await ProductModel.findOne({ _id: pid }).populate(
      "category",
      "name"
    );
    // let products = product[0];
    product.rating = product.rating.toFixed(1);
    res.status(200).json({ msg: "got product moreInfo", product });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "error from moreInfo", error });
  }
};

//==========================================

const productSearch = async (req, res) => {
  try {
    const { keyword, page, size, priceCatArr } = req.body;
    let skip = (page - 1) * size;
    const category = await CategoryModel.find({});
    let categoryList = await createCategories(category);
    const keyCat = await CategoryModel.findOne({
      name: { $regex: keyword, $options: "i" },
    });
    let filtered = await categoryList.filter(
      (parent) => parent?.slug === keyCat?.slug
    );
    let catPlain = getPlainCatList(filtered);
    // if not top parent
    const category2 = await CategoryModel.find({
      $or: [{ _id: keyCat?._id }, { parentId: keyCat?._id }],
    });

    let args = {
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { category: keyCat?.parentId ? category2 : catPlain },
      ],
    };
    if (priceCatArr.length > 0)
      args.price = { $gte: priceCatArr[0], $lte: priceCatArr[1] };

    const totalProd = await ProductModel.find(args);
    const products = await ProductModel.find(args)
      .skip(skip)
      .limit(size)
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.status(200).send({
      msg: "got product from search",
      products,
      total: totalProd?.length,
    });
  } catch (error) {
    console.log(error);
    res.status(401).send({ msg: "error from productSearch", error });
  }
};
//===============================================================
const similarProducts = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await ProductModel.find({
      category: cid,
      _id: { $ne: pid },
    })
      .populate("category", "name")
      .limit(12)
      .sort({ updatedAt: -1 });
    res.status(200).send({ msg: "got product from search", products });
  } catch (error) {
    console.log(error);
    res.status(401).send({ msg: "error from similarProducts", error });
  }
};
//============================================ was for home pge
const productFilter = async (req, res) => {
  try {
    const { checkedCat, priceCat, pageOrSize } = req.body;
    let page = pageOrSize?.page;
    let size = pageOrSize?.size;
    let skip = (page - 1) * size;
    let args = {};
    if (checkedCat.length > 0) args.category = checkedCat;
    if (priceCat.length > 0)
      args.price = { $gte: priceCat[0], $lte: priceCat[1] };
    const total = (await ProductModel.find(args)).length;
    const products = await ProductModel.find(args)
      .skip(skip)
      .limit(size)
      .populate("category")
      .sort({ updatedAt: -1 });

    res.status(200).send({ success: true, products, total });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ success: false, msg: "error from productFilter", error });
  }
};
//===========================================
const singleProduct = async (req, res) => {
  try {
    const singleProduct = await ProductModel.findOne({ _id: req.params.pid })
      .populate("category", "name")
      .populate("user", { password: 0 });

    if (!singleProduct) {
      return res.status(400).send("No data found");
    }
    res.status(200).send(singleProduct);
  } catch (error) {
    res.status(401).json({ msg: "error from singleProduct", error });
  }
};

//=================================================================
let deleteProduct = async (req, res) => {
  try {
    let pid = req.params.pid;
    let deleteItem = await ProductModel.findById(pid);
    if (!deleteItem) {
      return res.status(400).send({ msg: "No data found" });
    }
    if (deleteItem.picture?.length && deleteItem.picture[0].public_id) {
      let publicPaths = await deleteItem?.picture?.map((pic) => pic.public_id);
      for (dpath of publicPaths) {
        await deleteImageOnCloudinary(dpath);
      }
    }

    await ProductModel.findByIdAndDelete(pid);
    res.status(200).send({ msg: "Product deleted successfully" });
  } catch (error) {
    res.status(401).send({ msg: "error from deleteProduct", error });
  }
};

//============checkout ==========================

const orderCheckout = async (req, res) => {
  try {
    const { cart, total } = req?.body;
    let baseurl = process.env.BASE_URL;
    let trxn_id = "DEMO" + uuidv4();

    let lineItems = await cart.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item?.name,
          images: [item?.picture[0]?.secure_url],
        },
        unit_amount: (item?.price - (item?.price * item?.offer) / 100) * 100,
      },
      quantity: item?.amount,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${baseurl}/products/payment/success/${trxn_id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseurl}/products/payment/fail/${trxn_id}`,

      client_reference_id: req.user?.name,
      customer_email: req.user?.email,

      // billing_address_collection: "required",

      // shipping_address_collection: {
      //   allowed_countries: ["US", "BR", "BD"],
      // },

      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 500,
              currency: "usd",
            },
            display_name: "Free shipping",
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: 5,
              },
              maximum: {
                unit: "business_day",
                value: 15,
              },
            },
          },
        },
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 1500,
              currency: "usd",
            },
            display_name: "Next day air",
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: 1,
              },
              maximum: {
                unit: "business_day",
                value: 1,
              },
            },
          },
        },
      ],

      // shipping_options: [
      //   {
      //     shipping_rate: "shr_1QDffEHPFVNGKjCSlQaFjuHK", // shipping rate id in stripe acc
      //     shipping_rate: "shr_1QDejYHPFVNGKjCSYDjrIGqa", // shipping rate id in stripe acc
      //   },
      // ],
    });

    let order = {
      products: cart,
      total,
      payment: {
        trxn_id,
      },
      user: req.user._id,
    };
    await OrderModel.create(order);

    res.status(200).send({ success: true, session });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ success: false, msg: "error from orderCheckout", error });
  }
};

//======================================================
const orderSuccess = async (req, res) => {
  try {
    let { trxn_id } = req.params,
      { session_id } = req.query;

    // const session = await stripe.checkout.sessions.retrieve(
    //   req.query?.session_id,)

    const session = await stripe.checkout.sessions.retrieve(
      req.query?.session_id,
      { expand: ["payment_intent.payment_method"] }
    );
    let updated = await OrderModel.findOneAndUpdate(
      { "payment.trxn_id": trxn_id },
      {
        "payment.status": true,
        "payment.payment_id": session.payment_intent.id,
        "payment.payment_method": session.payment_intent.payment_method,
      },
      { new: true }
    );

    if (updated.isModified) {
      for (let v of updated.products) {
        let product = await ProductModel.findById(v._id);
        product.quantity = product.quantity - v.amount;
        product.save();
      }
    }
    // res.redirect(`${process.env.BASE_URL}/products/reportView/${updated._id}`);
    res.redirect(
      `${process.env.BASE_URL}/products/pdf-generate-mail/${updated._id}`
    );
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ success: false, msg: "error from orderSuccess", error });
  }
};
//============================================================
const reportView = async (req, res) => {
  // try {
  //   let { pid } = req.params;
  //   let order = await OrderModel.findById(pid).populate("user", "-password");
  //   res.render("productOrder", {order});
  // } catch (error) {
  //   console.log(error);
  //   res
  //     .status(500)
  //     .send({ success: false, msg: "error from reportView", error });
  // }
};
//============================================================

// ==================pdf-creator-node

const pdfGenerateMail = async (req, res) => {
  try {
    let { pid } = req.params;

    let order = await OrderModel.findById(pid).populate("user", "-password");
    if (!order) return res.send("no order");

    let data = {
      order: order,
    };

    let ejsPath = path.resolve(__dirname, "../views/productOrder.ejs");
    const htmlString = fs.readFileSync(ejsPath).toString();
    let ejsData = ejs.render(htmlString, data);

    let htmlPath = path.resolve(__dirname, "../views/orderTemp.html");
    var html = fs.readFileSync(htmlPath, "utf-8");

    var options = {
      format: "A4",
      orientation: "portrait",
      border: "10mm",
      // header: {
      //   height: "45mm",
      //   contents: '<div style="text-align: center;">Author: Shyam Hajare</div>',
      // },
      // footer: {
      //   height: "28mm",
      //   contents: {
      //     first: "Cover page",
      //     2: "Second page", // Any page number is working. 1-based index
      //     default:
      //       '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
      //     last: "Last Page",
      //   },
      // },
    };
    var document = {
      html: ejsData,
      // html,
      data: {
        order,
      },
      path: "./order.pdf",
      type: "application/pdf",
    };
    await pdfCreator.create(document, options);
    // .then((res) => {
    //   console.log(res);
    // })
    // .catch((error) => {
    //   console.error(error);
    // });
    let credential = {
      email: order.user?.email,
      subject: "Order successful",
      attachments: [{ path: `${path.join(__dirname, "../", "order.pdf")}` }],
      body: `<h2>Hi ${order.user?.name},</h2>
                    <h3>You have placed order successfully. Your order ID is ${order?._id}. </h3>
                    Thanks for staying with us`,
    };
    await mailer(credential);

    await fs.unlinkSync(`${path.join(__dirname, "../", "order.pdf")}`);

    return res.redirect(
      `${process.env.FRONT_URL}/products/payment/success/${order?._id}`
    );

    // return res.send("okkkkkkkkkkkkkkkkkkkkkkkkkkmmmmmm");
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ success: false, msg: "error from pdfGenerateMail", error });
  }
};

//=================puppeteer

// const pdfGenerateMail = async (req, res) => {
//   try {
//     let { pid } = req.params;

//     let order = await OrderModel.findById(pid).populate("user", "-password");
//     if (!order) return res.send("no order")

//       let data = {
//         order:order
//     };

//       let ejsPath = path.resolve(__dirname, "../views/productOrder.ejs");
//       const htmlString = fs.readFileSync(ejsPath).toString()
//       let ejsData = ejs.render(htmlString, data)
//       //  res.render("productOrder", { order });

//     let browser = await puppeteer.launch({
// // userDataDir:'./.cache/pupprteer',
// //       ignoreDefaultArgs: ["--disable-extension"],
//       // executablePath: "/usr/bin/google-chrome-stable",
//       // args: [
//       //   "--no-sandbox",
//       //   "--disable-setuid-sandbox",
//       //   "--single-process",
//       //   "no-zygote",
//       // ],
//       // headless: true,
//       // executablePath: process.env.NODE_ENV === 'production' ? process.env.PUPPETEER_EXECUTABLE_PATH : puppeteer.executablePath()
//     });
//     let page = await browser.newPage();
//     await page.setContent(ejsData)

//     // await page.setContent('<h2>helloooooooooooooooooooooo</h2>');
//     // await page.emulateMedia('screen')

// //========== url theke pdf korte
//     // await page.goto(
//     //   // `http://localhost:5173/`,
//     //   `${process.env.BASE_URL}/products/pdf-generate-mail/${order?._id}`,
//     //   {
//     //     waitUntil: "networkidle2",
//     //   }
//     // );

//     await page.setViewport({ width: 1280, height: 1050 });
//     let pdfSaved = await page.pdf({
//       path: `${path.join(__dirname, "../public/files","order.pdf")}`,
//       format: "A4",
//       printBackground: true,
//     });
//    await browser.close()
//     // // process.exit()

//     //  let credential = {
//     //    email: order.user?.email,
//     //    subject: "Order successful",
//     //    attachments: [
//     //     { path: `${path.join(__dirname, "../public/files", "order.pdf")}`},
//     //    ],
//     //    body: `<h2>Hi ${order.user?.name},</h2>
//     //             <h3>You have placed order successfully. Your order ID is ${order?._id}. </h3>
//     //             Thanks for staying with us`,
//     //  };
//     // await mailer(credential);

//     //=========== for seen, print and download

//     // let pdfURL = `${path.join(__dirname, "../public/files", "order.pdf")}`;
//     // res.set({
//     //   "Content-Type": "application/pdf",
//     //   "Content-Length": pdfSaved.length,
//     // })
//     // res.sendFile(pdfURL)

//     //======== for direct download=======
//     // res.download(pdfURL, function (err) {
//     //   if(err){console.log(err);}
//     // })

//     // return res.redirect(
//     //    `${process.env.FRONT_URL}/products/payment/success/${order?._id}`
//     //  );

//    return res.send('okkkkkkkkkkkkkkkkkkkkkkkkkkmmmmmm')
//   } catch (error) {
//     console.log(error);
//     res
//       .status(500)
//       .send({ success: false, msg: "error from pdfGenerateMail", error });
//   }
// };

// ============================================================

  
  
const orderFail = async (req, res) => {
  try {
    let trxn_id = req.params.trxn_id;
    let deleted = await OrderModel.findOneAndDelete({
      "payment.trxn_id": trxn_id,
    });
    if (deleted.$isDeleted) {
      res.redirect(`${process.env.FRONT_URL}/products/payment/fail`);
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ success: false, msg: "error from orderFail", error });
  }
};

//======================================================================
const reviewProduct = async (req, res) => {
  try {
    const { name, email, review, pid } = req.body;
    if (!review || !name || !pid) {
      return res.json({ msg: "Name and review are required" });
    }
    await ReviewModel.create({ name, email, review, pid });
    let product = await ProductModel.findById(pid);
    await ProductModel.findByIdAndUpdate(pid, { review: product?.review + 1 });

    res.status(201).json({ msg: "Thanks for your review", success: true });
  } catch (error) {
    res.status(500).json({ msg: "error from review", error });
  }
};

//======================================================================
const ratingProduct = async (req, res) => {
  try {
    const { name, email, rating, pid } = req.body;
    if (!rating || !name || !pid) {
      return res.json({ msg: "Name and rating are required" });
    }
    await RatingModel.create({ name, email, rating, pid });
    let product = await ProductModel.findById(pid);
    let calRating =
      (product?.rating * product?.ratingNo + rating) / (product?.ratingNo + 1);
    await ProductModel.findByIdAndUpdate(pid, {
      rating: calRating,
      ratingNo: product?.ratingNo + 1,
    });

    res.status(201).json({ msg: "Thanks for your rating", success: true });
  } catch (error) {
    res.status(500).json({ msg: "error from rating", error });
  }
};

//================================================
const getReview = async (req, res) => {
  try {
    const { pid } = req.params;
    const reviews = await ReviewModel.find({ pid }).sort({ createdAt: -1 });
    res.status(200).json({ msg: "got review", reviews });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "error from moreInfo", error });
  }
};

//===============================================================
const offerProductList = async (req, res) => {
  try {
    const { page, size } = req.query;
    let skip = (page - 1) * size;

    const total = (await ProductModel.find({ offer: { $gt: 0 } })).length;
    const products = await ProductModel.find({ offer: { $gt: 0 } })
      .skip(skip)
      .limit(size)
      .populate("category", "name")
      .sort({ updatedAt: -1 });

    // console.log(total, products);
    res.status(200).send({ success: true, products, total });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ success: false, msg: "error from offerProductList", error });
  }
};

//===============================================================
const getCartUpdate = async (req, res) => {
  try {
    const { cartIdArr } = req.body;
    let products = [];
    if (cartIdArr?.length) {
      for (let v of cartIdArr) {
        const prod = await ProductModel.findById(v).populate(
          "category",
          "name"
        );
        prod && (await products.push(prod));
      }
    }

    res.status(200).send({ msg: "got product from getCartUpdate", products });
  } catch (error) {
    console.log(error);
    res.status(401).send({ msg: "error from getCartUpdate", error });
  }
};


//===============================================================
const getStoreProducts = async (req, res) => {
  try {
    const { page, size, store } = req.query;
    let skip = (page - 1) * size;

    const total = (await ProductModel.find({storeName:store})).length;
    const products = await ProductModel.find({ storeName: store })
      .skip(skip)
      .limit(size)
      .populate("category", "name")
      .sort({ updatedAt: -1 });

    // console.log(total, products);
    res.status(200).send({ success: true, products, total });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ success: false, msg: "error from offerProductList", error });
  }
};
//==============================================================

module.exports = {
  createProduct,
  singleProduct,
  updateProduct,
  deleteProduct,
  productFilter,
  productSearch,
  similarProducts,
  moreInfo,
  productByCategory,
  orderCheckout,
  orderSuccess,
  orderFail,
  productList,
  reviewProduct,
  ratingProduct,
  getReview,
  offerProductList,
  getCartUpdate,
  pdfGenerateMail,
  reportView,
  getStoreProducts,
};
