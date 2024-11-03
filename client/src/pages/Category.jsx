import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { useSearch } from "../context/SearchContext";
import StoreType from "../components/StoreType";
import PageType from "../components/PageType";

const Category = () => {
  const [products, setProducts] = useState([]);
  let params = useParams();
  let { catPlain, Axios} = useAuth();
  let { priceCatArr, priceCat, setPriceCat } = useSearch();

  let catItem =
    catPlain.length && catPlain.find((item) => item.slug == params.slug);

  let catItemChildren =
    catItem && catPlain.filter((item) => item.parentId === catItem._id);

  //======================================================
  let [page, setPage] = useState(1);
  let [total, setTotal] = useState(0);
  let [loading, setLoading] = useState(false);
  let [query, setquery] = useState({});

  useEffect(() => {
    setPage(1);
  }, [params.slug]);

  let url = window.location.href;
  
  let queryFunc = (url) => {
    let queryStr = url.split("?")[1];
    let query = {};
    if (queryStr?.length) {
      let queryArr = queryStr.split("&");
      queryArr.forEach((element) => {
        let keyVal = element.split("=");
        query[keyVal[0]] = keyVal[1];
      });
      
      setquery(query)
    }
    return {};
  };

  //================================================
  let getProducts = async (page = 1) => {
    try {
      setLoading(true);
      let { data } = await Axios.post(`/products/category/${params.slug}`,
        {
          page: page,
          size: 12,
          priceCatArr,
          catSlug:params.slug
        }
      );
      setLoading(false);
      setTotal(data?.total);
      page === 1
        ? setProducts(data?.products)
        : setProducts([...products, ...data.products]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getProducts();
  }, [params.slug, priceCat]);

  useEffect(() => {
    queryFunc(url)
    setPriceCat('')
  }, [params.slug]);



  return (
    <Layout title={`Category-${params.slug}`}>
      <div className={loading ? "dim" : ""}>
        <div className={query?.type === "store" ? "" : "d-none"}>
          <StoreType
            value={{
              catItemChildren,
              products,
              total,
              setPage,
              getProducts,
              loading,
              page,
              params,
              Axios,
            }}
          />
        </div>
        <div className={query?.type === "page" ? "" : "d-none"}>
          <PageType
            value={{
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
            }}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Category;
