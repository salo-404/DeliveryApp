import { v4 } from "uuid"; // generates unique IDs for new menu items
import RestaurantManager from "../Models/RestaurantManager.mjs"; // RestaurantManager model — register and login logic
import { errorController } from "./ErrorController.mjs"; // sends error pages on failure
import { HTTP_STATUS, UserRoles } from "../Utils/constants.mjs"; // role and status constants
import { parseBody } from "../Utils/bodyParser.mjs"; // reads and decodes the POST request body
import { issueToken, verifyToken, revokeToken } from "../Utils/token.mjs";
import { renderHTML } from "../Utils/renderHTML.mjs"; // renders an HTML template with injected data
import RestaurantRepository from "../Database/RestaurantRepository.mjs"; // reads and writes restaurant and menu data
import OrderRepository from "../Database/OrderRepository.mjs"; // reads pending orders for this restaurant

const restaurantRepo = new RestaurantRepository(); // single instance reused across all restaurant handlers
const orderRepo = new OrderRepository(); // single instance reused across all restaurant handlers

export const restaurantController = {
  // handles POST /restaurant/register — creates a new restaurant manager account and logs them in
  register: async (req, res) => {
    try {
      console.log(
        "====================Registering a restaurant Manager===============",
      );
      const { restaurantName, password } = await parseBody(req); // extracts restaurant name and password from the form
      console.log(restaurantName, password);
      const manager = await RestaurantManager.register(
        restaurantName,
        password,
      ); // creates the manager in the DB
      console.log("====================Manager Info===============");
      console.log(manager);
      const existingRestaurant = await restaurantRepo.findByManagerId(manager.userId); // checks if a Restaurant row already exists for this manager
      if (!existingRestaurant) {
        await restaurantRepo.createRestaurant(v4(), restaurantName, manager.userId); // creates the Restaurant row linked to this manager
      }
      await issueToken(res, manager, UserRoles.MANAGER);
      console.log(
        "====================Session issued and MANAGER Role SET===============",
      );
      res.writeHead(HTTP_STATUS.TEMP_REDIRECT, {
        Location: "/restaurant/dashboard",
      }); // redirects to the manager dashboard
      res.end();
    } catch {
      errorController(HTTP_STATUS.BAD_REQUEST, req, res); // sends 400 if registration fails
    }
  },

  // handles POST /restaurant/login — verifies credentials and issues a JWT cookie
  login: async (req, res) => {
    try {
      console.log(
        "====================Logging IN a restaurant Manager===============",
      );
      const { restaurantName, password } = await parseBody(req); // extracts restaurant name and password from the form
      console.log(restaurantName, password)
      const manager = await RestaurantManager.login(restaurantName, password); // verifies restaurant name and password
      console.log(manager)
      await issueToken(res, manager, UserRoles.MANAGER);
      console.log(
        "====================Session issued properly===============",
      );
      res.writeHead(HTTP_STATUS.TEMP_REDIRECT, {
        Location: "/restaurant/dashboard",
      }); // redirects to the manager dashboard
      res.end();
    } catch(error) {
      console.log(error)
      errorController(HTTP_STATUS.UNAUTHORIZED, req, res); // sends 401 if credentials are wrong
    }
  },

  logout: async (req, res) => {
    await revokeToken(req);
    res.setHeader("Set-Cookie", "token=; HttpOnly; Path=/; Max-Age=0");
    res.writeHead(HTTP_STATUS.TEMP_REDIRECT, { Location: "/login" });
    res.end();
  },

  // handles GET /restaurant/dashboard — renders the manager dashboard with live menu and order data
  dashboard: async (req, res) => {
    try {
      const { userId, restaurantName } = await verifyToken(req);
      const restaurant = await restaurantRepo.findByManagerId(userId); // looks up the manager's restaurant in the DB
      let menuItems = "<li class='empty'>No menu items yet.</li>"; // fallback until menu items are added
      let orders = "<li class='empty'>No pending orders.</li>"; // fallback until orders come in
      if (restaurant) {
        const items = await restaurantRepo.findMenuByRestaurantId(restaurant.restaurantId); // fetches all menu items for this restaurant
        if (items.length) menuItems = items.map(i => `<li>${i.name} — $${Number(i.price).toFixed(2)}</li>`).join(""); // renders each menu item as a list entry
        const pendingOrders = await orderRepo.findByRestaurantId(restaurant.restaurantId); // fetches all active orders for this restaurant
        if (pendingOrders.length) orders = pendingOrders.map(o => `<li>Order ${o.orderId} — ${o.status}</li>`).join(""); // renders each order with its current status
      }
      await renderHTML(res, "Dash-ManagerView.html", {
        restaurantName, // injected into {{restaurantName}} in the view
        orders, // injected into {{orders}} in the view
        menuItems, // injected into {{menuItems}} in the view
      });
    } catch {
      res.writeHead(HTTP_STATUS.TEMP_REDIRECT, { Location: "/restaurant/login" }); // token missing or expired — send manager back to login
      res.end();
    }
  },

  // handles POST /restaurant/menu/add — adds a new item to the manager's restaurant menu
  addMenuItem: async (req, res) => {
    try {
      const { userId } = await verifyToken(req);
      const { name, price, description } = await parseBody(req); // extracts item fields from the form
      const restaurant = await restaurantRepo.findByManagerId(userId); // looks up the restaurant this manager owns
      if (!restaurant) return errorController(HTTP_STATUS.NOT_FOUND, req, res); // manager has no restaurant yet
      const itemId = v4(); // generates a unique ID for this menu item
      await restaurantRepo.addMenuItem(itemId, restaurant.restaurantId, name, price, description); // persists the new item to the DB
      res.writeHead(HTTP_STATUS.TEMP_REDIRECT, { Location: "/restaurant/dashboard" }); // redirects back to the dashboard to see the updated menu
      res.end();
    } catch {
      errorController(HTTP_STATUS.SERVER_ERROR, req, res); // sends 500 if anything goes wrong
    }
  },
};
