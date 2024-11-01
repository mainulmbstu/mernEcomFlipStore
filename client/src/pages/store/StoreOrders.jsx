import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import moment from "moment";
import { Select } from "antd";
import Layout from "../../components/Layout";
import axios from "axios";
let { Option } = Select;
import InfiniteScroll from "react-infinite-scroll-component";
import PriceFormat from "../../Helper/PriceFormat";
import { useReactToPrint } from "react-to-print";
import Print from "../../components/Print";
import StoreMenu from "./StoreMenu";


const StoreOrders = () => {
  let [adminOrders, setAdminOrders] = useState([]);
  let [status, setStatus] = useState([
    "Not Process",
    "Processing",
    "shipped",
    "delivered",
    "cancelled",
  ]);
  let [loading, setLoading] = useState(false);
  let { token, userInfo, Axios } = useAuth();
  let [printItem, setPrintItem] = useState("");

  //============================================================
  let [page, setPage] = useState(1);
  let [total, setTotal] = useState(0);

  let getAdminOrders = async () => {
    page === 1 && window.scrollTo(0, 0);
    try {
      setLoading(true);
      let res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/admin/order-list`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ page, size: 8 }),
        }
        // {
        //   params: {
        //     page: page,
        //     size: 8,
        //   },
        //   headers: { Authorization: `Bearer ${token}` },
        // }
      );
      let data = await res.json();
      setPage(page + 1);
      setTotal(data.total);
      setAdminOrders([...adminOrders, ...data.orderList]);
      setLoading(false);
    } catch (error) {
      console.log("order", error);
    }
  };

  useEffect(() => {
    if (token && userInfo.role) getAdminOrders();
  }, [token, userInfo.role]);

  let statusHandle = async (oid, val) => {
    try {
      let res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/admin/order/status/${oid}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: val }),
        }
      );
      let data = await res.json();
      await alert(data.msg);
    } catch (error) {
      console.log(error);
    }
  };

  let totalPrice =
    adminOrders?.length &&
    adminOrders?.reduce((previous, current) => {
      return previous + current.total;
    }, 0);
  //=============================================
  let [searchVal, setSearchVal] = useState("");
  // let [page, setPage] = useState(1);

  let getSearchAdminOrders = async (e, page = 1) => {
    e && e.preventDefault();
    try {
      if (!searchVal) return;
      setLoading(true);
      let { data } = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/admin/order-search`,
        {
          params: {
            keyword: searchVal,
            page: page,
            size: 8,
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setLoading(false);

      setTotal(data.total);
      page === 1
        ? setAdminOrders(data?.searchOrders)
        : setAdminOrders([...adminOrders, ...data.searchOrders]);
    } catch (error) {
      console.log(error);
    }
  };

  // useEffect(() => {
  //   if (searchVal) getSearchAdminOrders();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [searchVal]);

  // work when input tag is not in form tag
  useEffect(() => {
    setPage(1);
  }, [searchVal]);

  //=============== print
  let contentRef = useRef();
  let printAddress = useReactToPrint({
    contentRef,
    documentTitle: print?._id,
  });
  //===============================================================
  return (
    <Layout title={"Admin orders"}>
      <div className={loading ? "dim" : ""}>
        <div className="row ">
          {/* <h1>{[...Array(adminOrders.length/2)].map((_, i) => {
            return <span>{i+1} </span>
          })}</h1> */}
          <div className="col-md-3 p-2">
            <div className="card p-2 myAdminPanel">
              <StoreMenu />
              <div className=" card p-2 mt-5">
                <h4>
                  Total Orders: ({adminOrders?.length} of {total})
                </h4>
                <h4>Total Sale: {<PriceFormat price={totalPrice} />}</h4>
              </div>
            </div>
          </div>
          <div className=" col-md-9 px-2">
            <div className=" d-flex mt-2">
              <div className="col-md-4">
                <form onSubmit={getSearchAdminOrders}>
                  <input
                    className=" form-control"
                    type="text"
                    value={searchVal}
                    required
                    placeholder="search by email, phone or status"
                    onChange={(e) => setSearchVal(e.target.value)}
                  />
                </form>
              </div>
              <button
                onClick={(e) => getSearchAdminOrders(e, 1)}
                className="btn btn-success ms-2"
              >
                Search Order
              </button>
            </div>
            <div className="row ">
              {/* {loading && <Loading />} */}
              <InfiniteScroll
                dataLength={adminOrders.length}
                next={
                  !searchVal
                    ? getAdminOrders
                    : (e) => {
                        setPage(page + 1);
                        getSearchAdminOrders(e, page + 1);
                      }
                }
                hasMore={adminOrders.length < total}
                loader={<h1>Loading...</h1>}
                endMessage={<h4 className=" text-center">All items loaded</h4>}
              >
                {adminOrders.length &&
                  adminOrders?.map((item, i) => {
                    return (
                      <div key={item._id} className=" mt-2 p-1 shadow">
                        <table className="table">
                          <thead>
                            <tr>
                              <th scope="col">#</th>
                              <th scope="col">Status</th>
                              <th scope="col">User-email</th>
                              <th scope="col">User-Phone</th>
                              <th scope="col">Payment ID</th>
                              <th scope="col">User-Address</th>
                              <th scope="col">Payment</th>
                              <th scope="col">Item</th>
                              <th scope="col">Total Price</th>
                              <th scope="col">Time</th>
                              <th scope="col">Set up</th>
                              <th scope="col">Print</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>{i + 1} </td>
                              <td
                                className={
                                  item?.status === "Cancelled"
                                    ? "bg-danger"
                                    : ""
                                }
                              >
                                <Select
                                  variant={false}
                                  defaultValue={item?.status}
                                  onChange={(val) =>
                                    statusHandle(item._id, val)
                                  }
                                >
                                  {status.map((st, i) => (
                                    <Option key={i} value={st}>
                                      {st}
                                    </Option>
                                  ))}
                                </Select>
                              </td>

                              <td>{item?.user?.email} </td>
                              <td>{item?.user?.phone} </td>
                              <td>{item?.payment?.payment_id} </td>
                              <td>{item?.user?.address} </td>
                              <td>
                                {item?.payment?.status ? "Success" : "Failed"}
                              </td>
                              <td>{item?.products?.length} </td>
                              <td>{<PriceFormat price={item.total} />} </td>
                              <td>{moment(item?.createdAt).fromNow()} </td>
                              <td>
                                <button
                                  onClick={() => {
                                    setPrintItem(item);
                                  }}
                                  className="btn btn-info"
                                  disabled={item?.status==='Cancelled'}
                                >
                                  {printItem?._id === item?._id
                                    ? "OK"
                                    : "Set Print"}
                                </button>
                              </td>
                              <td>
                                <button
                                  onClick={() => {
                                    printAddress();
                                  }}
                                  className="btn btn-primary"
                                  disabled={printItem?._id !== item?._id}
                                >
                                  Print
                                </button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        {item?.products?.length &&
                          item?.products?.map((p, i) => {
                            return (
                              <div key={i} className="row g-5 mb-2">
                                <div className="row g-4">
                                  <div className=" col-4">
                                    <img
                                      src={`${p?.picture[0]?.secure_url}`}
                                      className=" ms-3"
                                      width={100}
                                      height={100}
                                      alt="image"
                                    />
                                  </div>
                                  <div className=" col-8 d-flex flex-column">
                                    <div>
                                      <h5>
                                        Name: {p?.name}- Price:{" "}
                                        {
                                          <PriceFormat
                                            price={
                                              p?.price -
                                              (p?.price * p?.offer) / 100
                                            }
                                          />
                                        }
                                      </h5>
                                      <p>Category: {p?.category?.name} </p>
                                      <p
                                        className={
                                          p?.color?.length ? "" : "d-none"
                                        }
                                      >{`Color: ${
                                        p?.color?.length && p?.color[0]
                                      }`}</p>
                                      <p>{`Qnty: ${p?.amount}`}</p>
                                      <p>
                                        Sub-Total:{" "}
                                        {
                                          <PriceFormat
                                            price={
                                              (p?.price -
                                                (p?.price * p?.offer) / 100) *
                                              p.amount
                                            }
                                          />
                                        }{" "}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    );
                  })}
              </InfiniteScroll>
            </div>
            <div className="d-flex">
              {adminOrders.length < total ? (
                <>
                  <button
                    onClick={
                      !searchVal
                        ? getAdminOrders
                        : (e) => {
                            setPage(page + 1);
                            getSearchAdminOrders(e, page + 1);
                          }
                    }
                    className="btn btn-primary my-3 px-3 mx-auto"
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Load More"}
                  </button>
                </>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
        <Print ref={contentRef} printItem={printItem} />
      </div>
    </Layout>
  );
};

export default StoreOrders;
