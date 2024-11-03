const express = require("express");
const loginMiddleware = require("../middleware/loginMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const commonMiddleware = require("../middleware/commonMiddleware");
const productControlls = require("../controllers/productControlls");
const upload = require("../middleware/multerMiddleware");

const router = express.Router();

router.post('/create-product', loginMiddleware, commonMiddleware, upload.array('picture', 10), productControlls.createProduct)
router.post('/create-page', loginMiddleware, adminMiddleware, upload.fields([
    { name: 'banners', maxCount: 20 },
    {name:'products'}
]), productControlls.createPage)
// router.post('/create-product', loginMiddleware, adminMiddleware, upload.single('picture'), productControlls.createProduct)

// router.get("/product-list", productControlls.productList);
router.post("/category/:slug", productControlls.productByCategory);
router.post("/product-filter", productControlls.productFilter);

router.get("/more-info/:pid", productControlls.moreInfo);
//=============product list

router.get("/product-list-limit", productControlls.productList);
router.get("/offers", productControlls.offerProductList);
//search
router.post("/search", productControlls.productSearch);
//simila products
router.get("/search/similar/:pid/:cid", productControlls.similarProducts);

router.post('/update-product/:pid', loginMiddleware, commonMiddleware, upload.array('picture',20), productControlls.updateProduct)

router.delete('/delete-product/:pid', loginMiddleware, commonMiddleware, productControlls.deleteProduct)
router.post('/review', productControlls.reviewProduct)
router.post('/rating', productControlls.ratingProduct)
router.get("/getreview/:pid", productControlls.getReview);
router.post("/cart-update", productControlls.getCartUpdate);
router.get("/store/:store", productControlls.getStoreProducts);
router.get("/page/:cid", productControlls.getProductsPage);
router.delete("/delete-page/:pid", productControlls.deleteProductsPage);


// ============== checkout ========================================

//===============for stripe
router.post("/order/checkout", loginMiddleware, productControlls.orderCheckout);
router.get("/payment/success/:trxn_id",productControlls.orderSuccess);
router.get("/payment/fail/:trxn_id", productControlls.orderFail);
router.get("/pdf-generate-mail/:pid", productControlls.pdfGenerateMail);
router.get("/reportView/:pid", productControlls.reportView);







module.exports=router