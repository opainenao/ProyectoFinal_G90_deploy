import React, { useContext } from "react";
import { CartContext } from "../context/CartProvider";
import { formatPrice } from "../utils/formatPrice";
import { MinusCircle, PlusCircle, Trash2 } from "lucide-react";


const CartItem = ({ item, kit, updateQuantity, removeFromCart }) => {
  return (
    <div className="d-flex align-items-center border-bottom py-3">
      <img
        src={kit.img}
        alt={kit.name}
        className="me-3"
        style={{ width: "90px", height: "90px", objectFit: "cover", borderRadius: "8px" }}
      />

      <div className="flex-grow-1">
        <h5 className="mb-1">{kit.name}</h5>
        <p className="text-muted mb-2">{formatPrice(kit.price)}</p>

        <div className="d-flex align-items-center">
          <button
            className="btn btn-link p-0 me-2"
            onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
          >
            <MinusCircle size={22} />
          </button>

          <span className="px-3 fw-bold">{item.quantity}</span>

        <button
            className="btn btn-link p-0 ms-2"
            onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
          >
            <PlusCircle size={22} />
          </button>
        </div>
      </div>

      <button
        className="btn btn-link text-danger"
        onClick={() => removeFromCart(item.itemId)}
      >
        <Trash2 size={26} />
      </button>
    </div>
  );
};

export default CartItem;
