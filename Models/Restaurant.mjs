import { v4 } from "uuid";

import OrderItem from "./OrderItem.mjs";

export default class Restaurant {
  // The owner should be Restaurant Manager instance
  constructor(restaurantName, owner) {
    this.restaurantId = v4();
    this.restaurantName = restaurantName;
    // COMPOSITION: Connects the Restaurant with its owner
    // THE owner would be a Restaurant Manager instance class
    this.owner = owner;
    // COMPOSITION: Connects the Restaurant Menu with the Items
    // IT has a relationship with another class here the Order item
    this.menu = [];
  }

  addItemToMenu(name, price, description) {
    // OrderItem is a class to relate to
    const newItem = new OrderItem(name, price, description);
    // We add OrderITems to the list menu
    this.menu.push(newItem);
    // menu = [OrderITem , OrderItem , OrderItem]
    return newItem;
  }

  getMenu() {
    // Go over the list of menu
    // The list of menu holds OrderITems
    return this.menu.map((item) => item.getItemInfo());
  }

  findItemByName(itemName) {
    // Typically we call this from a DB or Storage
    // HERE item is an instance of OrderItem
    return this.menu.find((item) => item.name == itemName) ?? null;
  }
}
