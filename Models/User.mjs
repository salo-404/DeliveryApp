export default class User {
  // An abstract Class

  constructor(userId) {
    if (this.constructor === User) {
      throw new Error("You cannot instantiate an Abstract Class `User`");
    }
    this.userId = userId;
  }

  // They will be overriden by subclasses methods
  static async register() {
    if (this == User) {
      throw new Error("Cannot call register() from an abstract class");
    }
    throw new Error(`${this.name} must implement the register()`);
  }

  static async login() {
    if (this == User) {
      throw new Error("Cannot call login() from an abstract class");
    }
    throw new Error(`${this.name} must implement the login()`);
  }

  static async logout() {
    if (this == User) {
      throw new Error("Cannot call logout() from an abstract class");
    }
    throw new Error(`${this.name} must implement the logout()`);
  }
}
