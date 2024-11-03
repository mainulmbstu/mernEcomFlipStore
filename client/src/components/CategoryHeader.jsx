import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const CategoryHeader = () => {
  let { category } = useAuth();
  let [show, setShow]=useState(false)

 let getCategoryList = (category) => {
   let myCategories = [];
   if (category.length) {
     for (let v of category) {
       myCategories.push(
         <li key={v.slug}>
           {v.parentId ? (
             <Link
               onClick={() => setShow(false)}
               to={`/products/category/${v.slug}?cid=${v._id}&type=${v.type}`}
             >
               {v.name}
             </Link>
           ) : (
             <span onMouseOver={() => setShow(true)}>{v.name} </span>
           )}
           {v.children.length > 0 ? (
             <ul className={`${show?'':'d-none'}`}>{getCategoryList(v.children)} </ul>
           ) : null}
         </li>
       );
     }
   }
   return myCategories;
 };
  


  return (
    <div className="catPage">
      <ul>
        <NavLink to={'/offers'} className=' me-3 my-auto text-decoration-none'>OFFERS</NavLink>
        {getCategoryList(category)}
      
        <NavLink to={'/register/seller'} className=' me-3 my-auto ms-auto text-decoration-none'>BE A SELLER</NavLink>
      </ul>
    </div>
  );
}

export default CategoryHeader