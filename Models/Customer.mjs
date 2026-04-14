import { v4 } from "uuid";
import bcrypt from "bcrypt";
import User from "./User.mjs";
import CustomerRepository from "../Database/CustomerRepository.mjs";
import { SALT_ROUNDS } from "../Utils/constants.mjs";

export default class Customer extends User {
  #orders;
  constructor(email, userId) {
    super(userId);
    this.email = email;
    this.#orders = [];
  }

  static async register(email, password) {
    console.log("===============Looking if email exists==================");
    const repo = new CustomerRepository();
    const emailExists = await repo.findByEmail(email);
    if (emailExists) {
      console.log("===============Email already in Use====================");
      return emailExists;
    }
    console.log("===============Registering a Customer==================");
    const userId = v4();
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const newCustomer = new Customer(email, userId);
    try {
      await repo.createUser(userId, email, hashedPassword);
    } catch (error) {
      console.log(error);
    }
    return newCustomer;
  }

  static async login(email, password) {
    console.log("===============Looking if email exists==================");
    const repo = new CustomerRepository();
    const accountExists = await repo.findByEmail(email);
    if (!accountExists) {
      console.log(
        "===============Email does not have an account====================",
      );
      throw new Error("Email not found");
    }
    console.log("===============Authenticating a Customer==================");
    const encryptedPassword = await accountExists.passwordHash;
    const checkPassword = await bcrypt.compare(password, encryptedPassword);
    if (!checkPassword) {
      throw new Error("Wrong Password");
    }
    return accountExists;
  }
}

// console.log("################## USER 1 ###################");
// const user1 = await Customer.register("toni@gmail.com", "pass123");
// console.log(user1);
// console.log("################## USER 2 ###################");
// const user2 = await Customer.register("karim@gmail.com", "pass123");
// console.log(user2);
// // console.log("################## USER 3 ###################");
// // const user3 = await Customer.login("tamer@gmail.com", "pass123");
// // console.log(user3);
// console.log("################## Authenticating ###################");
// const user4 = await Customer.login("toni@gmail.com", "pass124");
// console.log(user4);
