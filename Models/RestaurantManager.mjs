import User from "./User.mjs";
import { v4 } from "uuid";
import bcrypt from "bcrypt";
import { SALT_ROUNDS } from "../Utils/constants.mjs";

export default class RestaurantManager extends User {
  constructor(userId, restaurantName) {
    super(userId);
    this.restaurantName = restaurantName;
  }

  static async register(restaurantName, password) {
    // Create a user Id out of UUID V4
    const userId = v4();
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    // SHould be saved and stored inside the DB
    const newManager = new RestaurantManager(userId, restaurantName);
    return newManager;
  }
  static async login(restaurantName, password) {}
  static async logout(userId) {}
}

const manager = await RestaurantManager.register("BK12", "pass123");
