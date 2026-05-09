import { v4 } from "uuid"; // generates a unique ID for each new customer
import bcrypt from "bcrypt"; // handles password hashing and comparison
import User from "./User.mjs"; // inherits the abstract User base class
import CustomerRepository from "../Database/CustomerRepository.mjs"; // data access layer for Customer DB operations
import { SALT_ROUNDS } from "../Utils/constants.mjs"; // salt rounds constant used for bcrypt hashing
import { revokeToken } from "../Utils/token.mjs";
import { logger } from "../Utils/Logger.mjs";

export default class Customer extends User {
  #orders; // private field — the customer's order history, not directly accessible from outside

  constructor(email, userId) {
    super(userId); // calls User constructor — sets this.userId
    this.email = email;
    this.#orders = []; // starts with an empty order list on every new instance
  }

  static async register(email, password) {
    logger.debug("Checking whether the customer email is already registered.");
    const repo = new CustomerRepository(); // creates a repo instance connected to the DB singleton
    const emailExists = await repo.findByEmail(email); // checks if this email is already registered
    if (emailExists) {
      logger.info("Customer registration skipped because the email is already in use.");
      return emailExists; // returns the existing record instead of creating a duplicate
    }
    logger.info("Registering a new customer account.");
    const userId = v4(); // generates a new unique ID for this customer
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS); // hashes the password using the shared SALT_ROUNDS constant
    const newCustomer = new Customer(email, userId); // creates the in-memory Customer instance
    try {
      await repo.createUser(userId, email, hashedPassword); // persists the new customer to the DB
    } catch (error) {
      logger.error(error instanceof Error ? error.message : String(error)); // keep the app moving even if the write fails
    }
    return newCustomer; // returns the Customer instance even if DB write failed — caller cannot tell the difference
  }

  static async login(email, password) {
    logger.debug("Looking up the customer record before password verification.");
    const repo = new CustomerRepository();
    const accountExists = await repo.findByEmail(email); // fetches the customer row from DB by email
    if (!accountExists) {
      logger.warn("Customer login failed because the email was not found.");
      throw new Error("Email not found"); // throws so the caller knows login failed
    }
    logger.info("Authenticating a customer login attempt.");
    const encryptedPassword = await accountExists.passwordHash; // reads the hashed password from the DB row
    const checkPassword = await bcrypt.compare(password, encryptedPassword); // compares the plain input against the stored hash
    if (!checkPassword) {
      throw new Error("Wrong Password"); // throws so the caller knows the password was incorrect
    }
    return accountExists; // returns the raw DB row on success — not a Customer instance
  }

  static async logout(req, res) {
    await revokeToken(req);
    res.setHeader("Set-Cookie", "token=; HttpOnly; Path=/; Max-Age=0");
  }
}
