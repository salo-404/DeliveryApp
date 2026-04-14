import { v4 } from "uuid";

export default class Order {
  #items;
  constructor(customerId, restaurant) {
    this.orderId = v4();
    this.customerId = customerId;
    this.restaurant = restaurant;
    this.#items = [];
    this.totalPrice = 0;
  }

  addItems(itemName) {
    // CHICKEN BURGER
    // Created an instance of new item  byt searching it in the meny of the restaurant
    const newItem = this.restaurant.findItemByName(itemName); // CHICKEN BURGER
    // Added this new instance to the private list of items in this order
    this.#items.push(newItem);
    // Added the price to the whole(total) price of the order
    this.totalPrice += newItem.price;
  }

  getItems() {
    // Item is an instance of OrderItem
    return this.#items.map((item) => item.getItemInfo());
  }
}
