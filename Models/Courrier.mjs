import User from "./User.mjs";
import { v4 } from "uuid";
import bcrypt from "bcrypt";
import { SALT_ROUNDS } from "../Utils/constants.mjs";

export default class Courrier extends User {
  constructor(userId, phoneNumber) {
    super(userId);
    this.phoneNumber = phoneNumber;
  }

  // method overriding for Courrier
  static async register(phoneNumber, password) {
    console.log("Registering a Courrier");
    // Create a user Id out of UUID V4
    const userId = v4();
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    // SHould be saved and stored inside the DB

    const newCourrier = new Courrier(userId, phoneNumber);
    return newCourrier;
  }
  static async login() {}
  static async logout() {}
}

// // const courrier = new Courrier("user1", 70707070); // THIS IS WRONG
// // WHAT IF he was not registered?

// const courrier = await Courrier.register("70-707070", "pass123");
// console.log(courrier);
