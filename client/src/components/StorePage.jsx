import { useEffect, useState } from "react";
import Layout from "./Layout";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import InfiniteScroll from "react-infinite-scroll-component";
import ProductCard from "./ProductCard";

const StorePage = () => {
  const [products, setProducts] = useState([]);
  let [page, setPage] = useState(1);
  let [total, setTotal] = useState(0);
  let [loading, setLoading] = useState(false);
  let params = useParams();
  let { Axios } = useAuth();

  //================================================
  let size = 12;
  let getProducts = async (page = 1, size = 10) => {
    try {
      setLoading(true);
      let { data } = await Axios.get(`/products/store/${params?.store}`, {
        params: {
          page,
          size,
          store: params.store,
        },
      });
      setLoading(false);
      setTotal(data?.total);
      page === 1
        ? setProducts(data?.products)
        : setProducts([...products, ...data.products]);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    getProducts(page, size);
    setPage(1);
  }, [params.store]);

  return (
    <Layout title="store">
      <div className="px-2 mt-3">
        <h3 className=" text-capitalize">
          {products?.length
            ? `Store: ${params.store} (${products?.length} of ${total})`
            : ""}
        </h3>
        <h3 className=" text-danger">
          {!products?.length ? "No Product Found!!" : ""}
        </h3>
        <InfiniteScroll
          dataLength={products?.length}
          next={() => {
            setPage(page + 1);
            getProducts(page + 1, size);
          }}
          hasMore={products?.length < total}
          loader={<h1>Loading...</h1>}
          endMessage={<h4 className=" text-center">All items loaded</h4>}
        >
          <div className="row g-3">
            {products?.length &&
              products?.map((item) => (
                <ProductCard key={item._id} item={item} />
              ))}
          </div>
        </InfiniteScroll>
        <div className="d-flex">
          {products?.length < total ? (
            <>
              <button
                onClick={() => {
                  setPage(page + 1);
                  getProducts(page + 1, size);
                }}
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
    </Layout>
  );
};

export default StorePage;
