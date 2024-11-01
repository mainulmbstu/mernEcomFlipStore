import { NavLink } from "react-router-dom";

const StoreMenu = () => {
  return (
    <div className="card p-2 myAdminPanel">
      <h3>
        <NavLink
          to="/dashboard/store"
          className=" text-decoration-none text-white"
          aria-current="true"
        >
          Dashboard
        </NavLink>
      </h3>
      <div className="list-group">
        <NavLink
          to="/dashboard/store/profile"
          className="list-group-item list-group-item-action"
          aria-current="true"
        >
          Profile
        </NavLink>

        <NavLink
          to="/dashboard/store/create-product"
          className="list-group-item list-group-item-action"
          aria-current="true"
        >
          Products
        </NavLink>
        <NavLink
          to="/dashboard/store/order-list"
          className="list-group-item list-group-item-action"
          aria-current="true"
        >
          Orders
        </NavLink>
        <NavLink
          to="/dashboard/store/contacts"
          className="list-group-item list-group-item-action"
          aria-current="true"
        >
          Contacts
        </NavLink>
      </div>
    </div>
  );
};

export default StoreMenu;
