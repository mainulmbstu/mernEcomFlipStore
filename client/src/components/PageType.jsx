import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "./Layout";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import { useAuth } from "../context/AuthContext";
import ProductCard from "./ProductCard";
import PriceCategory from "./PriceCategory";
import { useSearch } from "../context/SearchContext";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";

const PageType = ({value}) => {
  let {
    catItemChildren,
    products,
    total,
    setPage,
    getProducts,
    loading,
    page,
    params,
    query,
    setLoading,
    Axios,
  } = value;

  //================================================
  let [pageInfo, setpageInfo] = useState('');

  let getPage = async () => {
    try {
      setLoading(true);
      let { data } = await Axios.get(`/products/page/${query?.cid}`,
        {
          params: {
            cid: query?.cid,
          },
        }
      );
      setLoading(false);
    setpageInfo(data.page)
    } catch (error) {
      console.log(error);
    }
  };

   useEffect(() => {
    getPage();
   }, [query]);

  let screen = window.screen.width;

  return (
    <Layout title={`Category-${"params.slug"}`}>
      <div className={loading ? "dim" : ""}>
        <div className="row">
          <PriceCategory />
          <div className="col-10 px-2">
            <div className="px-2 mt-3">
              <h3 className=" text-capitalize">
                {products?.length ? `Page Title: ${pageInfo?.title}` : ""}
              </h3>
              <h3 className=" text-danger">
                {!products?.length ? "No Product Found!!" : ""}
              </h3>
              <div className="border shadow mb-3">
                <Carousel
                  autoPlay={true}
                  infiniteLoop={true}
                  showThumbs={false}
                >
                  {pageInfo?.banners?.length &&
                    pageInfo?.banners.map((item) => {
                      return (
                        <div key={item._id}>
                          <img
                            src={item.secure_url}
                            alt="image"
                            height={screen >768? '400px':'200px'}
                          />
                          {/* <p className="legend">Special offer going on</p> */}
                        </div>
                      );
                    })}
                </Carousel>
              </div>

              <h3 className=" text-capitalize">
                {products?.length
                  ? `Products: (${products?.length} of ${total})`
                  : ""}
              </h3>
              <InfiniteScroll
                dataLength={products?.length}
                next={() => {
                  setPage(page + 1);
                  getProducts(page + 1);
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
                        getProducts(page + 1);
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
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PageType;
