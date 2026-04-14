import { v4 } from "uuid";

export default class OrderItem {
  constructor(name, price, description) {
    this.orderItemId = v4();
    this.name = name;
    this.price = price;
    this.description = description;
  }

  // not STATIC
  getItemInfo() {
    return {
      orderItemId: this.orderItemId,
      name: this.name,
      price: this.price,
      description: this.description,
    };
  }
}
