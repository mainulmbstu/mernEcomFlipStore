const express = require("express");
const loginMiddleware = require("../middleware/loginMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const storeMiddleware = require("../middleware/storeMiddleware");
const adminControlls = require("../controllers/adminControlls");
const storeControlls = require("../controllers/storeControlls");
const upload = require("../middleware/multerMiddleware");

const router = express.Router();

router.get('/product-list', loginMiddleware, storeMiddleware, storeControlls.storeProductList  )
router.get('/product-search', loginMiddleware, storeMiddleware, storeControlls.storeSearchProductList)

router.post("/category/:slug",loginMiddleware,storeMiddleware,  storeControlls.productByCategory);



router.post('/order-list', loginMiddleware, adminMiddleware, adminControlls.orderList  )

router.post('/order/status/:oid', loginMiddleware, adminMiddleware, adminControlls.orderStatusUpdate  )
router.get('/order-search', loginMiddleware, adminMiddleware, adminControlls.orderSearch  )

router.get('/total-sale', loginMiddleware, adminMiddleware, adminControlls.totalSale  )


// store authentication (for Private.jsx)
router.get("/storeAuth", loginMiddleware, storeMiddleware, (req, res) => {
  res.status(200).send({ ok: true });
});




module.exports=router