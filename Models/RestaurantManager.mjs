import User from "./User.mjs"; // inherits the abstract User base class
import { v4 } from "uuid"; // generates a unique ID for each new manager
import bcrypt from "bcrypt"; // handles password hashing and comparison
import { SALT_ROUNDS } from "../Utils/constants.mjs"; // shared bcrypt cost factor
import RestaurantManagerRepository from "../Database/RestaurantManagerRepository.mjs"; // data access layer for RestaurantManager
import { revokeToken } from "../Utils/token.mjs";
import { logger } from "../Utils/Logger.mjs";

export default class RestaurantManager extends User {
  constructor(userId, restaurantName) {
    super(userId); // calls User constructor — sets this.userId
    this.restaurantName = restaurantName; // managers are tied to a specific restaurant
  }

  static async register(restaurantName, password) {
    logger.debug("Checking whether the restaurant name is already registered.");
    const repo = new RestaurantManagerRepository();
    const exists = await repo.findByRestaurantName(restaurantName); // checks if this restaurant name is already registered
    if (exists) {
      logger.info("Restaurant manager registration skipped because the name is already in use.");
      return exists; // returns existing account instead of creating a duplicate
    }

    logger.info("Registering a new restaurant manager account.");
 
    const userId = v4(); // generates a unique ID for this manager
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS); // hashes the password before storing
    const newManager = new RestaurantManager(userId, restaurantName); // creates the in-memory RestaurantManager instance
    await repo.createManager(userId, restaurantName, hashedPassword); // persists the manager to the DB
    return newManager;
  }

  static async login(restaurantName, password) {
    logger.debug("Looking up the restaurant manager before password verification.");
    const repo = new RestaurantManagerRepository();
    const account = await repo.findByRestaurantName(restaurantName); // looks up the manager by restaurant name
    if (!account) {
      logger.warn("Restaurant manager login failed because the restaurant name was not found.");
      throw new Error("Restaurant not found"); // no account exists for this restaurant name
    }

    const checkPassword = await bcrypt.compare(password, account.passwordHash); // compares input against stored hash
    if (!checkPassword) throw new Error("Wrong Password"); // hash does not match — reject login

    return account; // returns the DB row — contains userId needed for JWT
  }

  static async logout(req, res) {
    await revokeToken(req);
    res.setHeader("Set-Cookie", "token=; HttpOnly; Path=/; Max-Age=0");
  }
}
