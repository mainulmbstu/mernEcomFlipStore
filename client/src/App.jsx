import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import "./App.css";

import { BrowserRouter, Route, Routes } from "react-router-dom";
// import Header from "./components/Header";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Contacts from "./pages/Contacts";
import Error from "./pages/Error";
import Privacy from "./pages/Privacy";
import { Private } from "./components/routes/Private";
import ForgotPassword from "./pages/ForgotPassword";
import { AdminAuth } from "./components/routes/AdminAuth";
// import AdminPanel from "./pages/admin/AdminPanel";
import Profile from "./pages/user/Profile";
import ProductInput from "./pages/admin/ProductInput";
import MoreInfo from "./components/MoreInfo";
import Category from "./pages/Category";
import AdminProfile from "./pages/admin/AdminProfile";
import { lazy, Suspense } from "react";
import PaymentSuccess from "./components/PaymentSuccess";
import PaymentFail from "./components/PaymentFail";
import Layout from "./components/Layout";
import Gallery from "./pages/user/Gallery";
import ResetNewPassword from "./pages/user/ResetNewPassword";
import AdminContacts from "./pages/admin/AdminContacts";
import CategoryHeader from "./components/CategoryHeader";
import AdminOffer from "./pages/admin/AdminOffer";
import { StoreAuth } from "./components/routes/StoreAuth";
// import StorePanel from "./pages/store/StorePanel";
import StoreProfile from "./pages/store/StoreProfile";
import StoreOrders from "./pages/store/StoreOrders";
import StoreContacts from "./pages/store/StoreContacts";
import Product from "./pages/store/Product";
// import StorePage from "./components/StorePage"

// let StorePag= lazy(()=>import('./components/StorePag'))
let StorePage = lazy(()=>import('./components/StorePage'))
let Header= lazy(()=>import('./components/Header'))
let StorePanel= lazy(()=>import('./pages/store/StorePanel'))
let AdminPanel= lazy(()=>import('./pages/admin/AdminPanel'))
let SearchResults= lazy(()=>import('./components/SearchResults'))
let Dashboard= lazy(()=>import('./pages/user/Dashboard'))
let OfferPage= lazy(()=>import('./components/OfferPage'))
let UserList = lazy(() => import("./pages/admin/UserList"));
let CartPage = lazy(() => import("./pages/CartPage"));
let CreateCategory= lazy(()=>import('./pages/admin/CreateCategory'))
let Home = lazy(() => import('./pages/Home'))
let AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
let Orders = lazy(() => import("./pages/user/Orders"));
let About = lazy(() => wait(1).then(() => import("./pages/About")));
let CreateProduct = lazy(() =>
  wait(1).then(() => import("./pages/admin/CreateProduct"))
);

let wait = (time) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

{/* <button onClick={() => {
  import('../folder/compo').then((module)=>setSome(module.exportedName))
}}>for learn</button> */}

const App = () => {
  return (
    <div className="App ">
      <BrowserRouter>
        <Layout />
        <Header />
        <CategoryHeader />
        <Suspense fallback={<h2>Loading...</h2>}>
          <Routes>
            <Route path="/" element=<Home /> />
            <Route path="/gallery" element=<Gallery /> />
            <Route path="/offers" element=<OfferPage /> />
            <Route
              path="/resetnewpassword/:email"
              element=<ResetNewPassword />
            />

            <Route path="/products/search" element=<SearchResults /> />
            <Route
              path="/products/payment/success/:oid"
              element=<PaymentSuccess />
            />
            <Route path="/products/payment/fail" element=<PaymentFail /> />
            <Route path="/cart" element=<CartPage /> />
            <Route path="/products/more-info/:pid" element=<MoreInfo /> />
            <Route path="/products/category/:slug" element=<Category /> />
            <Route path="/dashboard" element=<Private />>
              <Route path="user" element=<Dashboard /> />
              <Route path="user/profile" element=<Profile /> />
              <Route path="user/orders" element=<Orders /> />
            </Route>
            <Route path="/dashboard" element=<AdminAuth />>
              <Route path="admin" element=<AdminPanel /> />
              <Route path="admin/profile" element=<AdminProfile /> />
              <Route path="admin/create-category" element=<CreateCategory /> />
              <Route path="admin/create-product" element=<CreateProduct /> />
              <Route
                path="admin/create-product/input"
                element=<ProductInput />
              />
              <Route path="admin/user-list" element=<UserList /> />
              <Route path="admin/order-list" element=<AdminOrders /> />
              <Route path="admin/contacts" element=<AdminContacts /> />
              <Route path="admin/offers" element=<AdminOffer /> />
            </Route>

            {/* store */}
            <Route path="/dashboard" element=<StoreAuth />>
              <Route path="store" element=<StorePanel /> />
              <Route path="store/profile" element=<StoreProfile /> />
              <Route path="store/create-product" element=<Product /> />
              <Route
                path="store/create-product/input"
                element=<ProductInput />
              />
              <Route path="store/order-list" element=<StoreOrders /> />
              <Route path="store/contacts" element=<StoreContacts /> />
            </Route>

            <Route path="/login" element=<Login /> />
            <Route path="/register/:type" element=<Register /> />
            <Route path="/forgotpassword" element=<ForgotPassword /> />
            <Route path="/contacts" element=<Contacts /> />
            <Route path="/about" element=<About /> />
            <Route path="/privacy" element=<Privacy /> />
            <Route path="/products/:store" element=<StorePage /> />
            <Route path="/*" element=<Error /> />
          </Routes>
        </Suspense>
        <Footer />
      </BrowserRouter>
    </div>
  );
};

export default App;
