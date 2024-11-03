import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import Layout from "../../components/Layout";
import AdminMenu from "./AdminMenu";
import InfiniteScroll from "react-infinite-scroll-component";
import DeleteModal from "../../components/DeleteModal";

const CreatePage = () => {
  let [loading, setLoading] = useState(false);
  let [delItem, setDelItem] = useState("");
  const [inputVal, setInputVal] = useState({
    title: "",
    description: "",
    category: "",
    banners: "",
    products: "",
  });

  let { token, catPlain, Axios, userInfo } = useAuth();
  let inputHandle = (e) => {
    let { name, value } = e.target;
    setInputVal((prev) => ({ ...prev, [name]: value }));
  };

  //====================
  let [page, setPage] = useState(1);
  let [total, setTotal] = useState(0);
  let [productPage, setProductPage] = useState([]);
  let size = 10;

  let getPage = async (page = 1, size = 10) => {
    page === 1 && window.scrollTo(0, 0);
    try {
      setLoading(true);
      let { data } = await Axios.get(`/admin/product-page`, {
        params: {
          page,
          size,
        },
      });
      setTotal(data.total);
      page === 1
        ? setProductPage(data.pages)
        : setProductPage([...productPage, ...data.pages]);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  //=================================================
  let pageSubmit = async (e) => {
    e.preventDefault();

    let formdata = new FormData();

    inputVal.banners.length &&
      inputVal.banners.map((item) => formdata.append("banners", item));
    inputVal.products.length &&
      inputVal.products.map((item) => formdata.append("products", item));

    formdata.append("title", inputVal.title);
    formdata.append("description", inputVal.description);
    formdata.append("category", inputVal.category);

    try {
      setLoading(true);

      let { data } = await Axios.post(`/products/create-page`, formdata);
      setLoading(false);
      if (data.success) {
        toast.success(data.msg);
        setInputVal({
          title: "",
          description: "",
          category: inputVal.category,
          banners: inputVal.banners,
          products: inputVal.products,
        });
        getPage(1, page*size)
        setLoading(false);
      } else {
        toast.error(data.msg);
      }
    } catch (error) {
      setLoading(false);
      toast.error(error.response.data);
      console.log({ msg: "error from create page", error });
    }
  };

  useEffect(() => {
    if (token && userInfo.role === "admin") getPage(page, size);
  }, []);
  //================================================

  let deleteItem = async (id) => {
    setLoading(true);
    let res = await fetch(
      `${import.meta.env.VITE_BASE_URL}/products/delete-page/${id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    let data = await res.json();
    if (res.ok) {
      toast.success(`${delItem?.title} is deleted successfully`);
      setLoading(false);
      getPage();
    } else {
      toast.success(data?.msg);
    }
  };

  return (
    <Layout title={"Create page"}>
      <div className="row">
        <div className="col-md-3 p-2">
          <AdminMenu />
        </div>
        <div className="col-md-9 p-2" style={{ minHeight: "90vh" }}>
          <div className=" d-flex flex-column justify-content-start border">
            <div className="text-center shadow  py-4 p-2 col-md- mx-auto">
              <h4 className=" text-uppercase">Create new product page</h4>

              <div className=" p-2">
                <div className="card p-2">
                  <div className=" border">
                    <form
                      onSubmit={pageSubmit}
                      className="px-4"
                      encType="multipart/form-data"
                    >
                      <div className="mb-2">
                        <input
                          className="form-control"
                          list="categoryList"
                          type={"text"}
                          placeholder="Select category"
                          onChange={(e) => {
                            let cat =
                              catPlain?.length &&
                              catPlain.find(
                                (item) => item?.slug === e.target.value
                              );
                            setInputVal((prev) => ({
                              ...prev,
                              category: cat?._id,
                            }));
                          }}
                        />
                        <datalist id="categoryList">
                          {catPlain?.length &&
                            catPlain.map((item) => {
                              return (
                                <option
                                  key={item._id}
                                  value={item?.slug}
                                ></option>
                              );
                            })}
                        </datalist>
                      </div>

                      <input
                        onChange={inputHandle}
                        className=" form-control mb-2"
                        type="text"
                        name="title"
                        value={inputVal.title}
                        placeholder="Enter page title"
                      />

                      <textarea
                        onChange={inputHandle}
                        className=" form-control mb-2"
                        type="text"
                        rows="2"
                        name="description"
                        value={inputVal.description}
                        placeholder="Enter page description"
                      />

                      <div>
                        <label htmlFor="banner" className="">
                          Upload banners (jpeg, jpg, png, webp, Max size- 4mb)
                        </label>
                        <input
                          className=" form-control mb-2"
                          id="banner"
                          type="file"
                          name="banners"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            inputHandle({
                              target: {
                                name: "banners",
                                value: [...e.target.files],
                              },
                            });
                          }}
                        />
                      </div>

                      <div>
                        <label htmlFor="pic" className="">
                          Upload product image (jpeg, jpg, png, webp, Max size-
                          4mb)
                        </label>
                        <input
                          className=" form-control mb-2"
                          id="pic"
                          type="file"
                          name="products"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            inputHandle({
                              target: {
                                name: "products",
                                value: [...e.target.files],
                              },
                            });
                          }}
                        />
                      </div>

                      <div className=" d-flex justify-content-end">
                        {loading ? (
                          <>
                            <button
                              className="btn btn-primary w-50 fs-5 ms-2"
                              type="button"
                              disabled
                            >
                              <span
                                className="spinner-grow spinner-grow-sm"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Uploadin data...
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className=" btn  btn-primary text-white fs-5 w-50 ms-2 btn-outline-dark"
                              type="submit"
                            >
                              Create Page
                            </button>
                          </>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <InfiniteScroll
              dataLength={productPage?.length}
              next={() => {
                setPage(page + 1);
                getPage(page + 1, size);
              }}
              hasMore={productPage?.length < total}
              loader={<h1>Loading...</h1>}
              endMessage={<h4 className=" text-center">All items loaded</h4>}
            >
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Image</th>
                    <th scope="col">Title</th>
                    <th scope="col">Category</th>
                    <th scope="col">Delete</th>
                  </tr>
                </thead>

                <tbody>
                  {productPage?.length &&
                    productPage.map((item, i) => {
                      return (
                        <tr key={item._id}>
                          <td>{i + 1}</td>
                          <td>
                            <label htmlFor={item._id}>
                              <img
                                src={`${item?.banners[0]?.secure_url}`}
                                alt=""
                                width="30"
                              />
                            </label>
                          </td>
                          <td>{item.title}</td>
                          <td>{item.category?.name}</td>
                          <td>
                            <button
                              onClick={() => {
                                setPage(1);
                                setDelItem(item);
                              }}
                              className="btn btn-danger"
                              data-bs-toggle="modal"
                              data-bs-target="#deleteCategory"
                              disabled={loading}
                            >
                              {loading && item._id === delItem._id ? (
                                <>
                                  <div
                                    className="spinner-border text-primary"
                                    role="status"
                                    disabled
                                  >
                                    <span className="visually-hidden">
                                      Loading...
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <>Delete</>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </InfiniteScroll>
          </div>
        </div>
        <DeleteModal value={{ item: delItem, func: deleteItem }} />
      </div>
    </Layout>
  );
};

export default CreatePage;
