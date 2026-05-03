import { errorController } from "./ErrorController.mjs"; // sends error pages on failure
import { sendHTML } from "../Utils/sendHTML.mjs"; // sends a static HTML file with no data injection
import { sendCSS } from "../Utils/sendCSS.mjs"; // reads and sends a CSS file from Views/Styles/
import { renderHTML } from "../Utils/renderHTML.mjs"; // renders an HTML template with injected data
import { verifyToken } from "../Utils/token.mjs"; // reads and verifies the JWT from the request cookie
import { HTTP_STATUS } from "../Utils/constants.mjs"; // HTTP status code constants
import RestaurantRepository from "../Database/RestaurantRepository.mjs"; // reads restaurant and menu data from the DB

const restaurantRepo = new RestaurantRepository(); // single instance reused across all page handlers

export const pageController = {
  // serves GET /login — static login form, no data injection needed
  login: async (req, res) => {
    try {
      await sendHTML(res, "Auth-LoginView.html");
    } catch {
      errorController(HTTP_STATUS.SERVER_ERROR, req, res);
    }
  },

  // serves GET /register — static registration form, no data injection needed
  register: async (req, res) => {
    try {
      await sendHTML(res, "Auth-RegisterView.html");
    } catch {
      errorController(HTTP_STATUS.SERVER_ERROR, req, res);
    }
  },

  // serves GET /home — renders the customer home page with their email and restaurant list
  home: async (req, res) => {
    try {
      const { userEmail } = await verifyToken(req);
      const restaurants = await restaurantRepo.findAll(); // fetches every restaurant row from the DB
      const restaurantList = restaurants.length
        ? restaurants.map(r => `<li><a href="/restaurant/menu?id=${r.restaurantId}">${r.restaurantName}</a></li>`).join("") // each restaurant links to its menu page
        : "<li class='empty'>No restaurants available yet.</li>"; // fallback when no restaurants are registered
      await renderHTML(res, "User-HomeView.html", {
        userEmail, // injected into {{userEmail}} in the view
        restaurantList, // injected into {{restaurantList}} in the view
      });
    } catch {
      res.writeHead(HTTP_STATUS.TEMP_REDIRECT, { Location: "/login" }); // token missing or expired — send user to login instead of error page
      res.end();
    }
  },

  // serves GET /restaurant/menu?id=... — renders a restaurant's menu page for a logged-in customer
  restaurantMenu: async (req, res) => {
    try {
      await verifyToken(req);
      const url = new URL(req.url, `http://${req.headers.host}`); // parses the URL to extract query params
      const restaurantId = url.searchParams.get("id"); // reads the restaurant ID from the ?id= query string
      const restaurant = await restaurantRepo.findById(restaurantId); // fetches the restaurant row from the DB
      if (!restaurant) return errorController(HTTP_STATUS.NOT_FOUND, req, res); // 404 if the restaurant doesn't exist
      const items = await restaurantRepo.findMenuByRestaurantId(restaurantId); // fetches all menu items for this restaurant
      const menuItems = items.length
        ? items.map(i => `<li>${i.name} — $${Number(i.price).toFixed(2)}<br><small>${i.description ?? ""}</small></li>`).join("") // renders each item with name, price, and optional description
        : "<li class='empty'>No menu items yet.</li>"; // fallback when the menu is empty
      await renderHTML(res, "Customer-RestaurantMenuView.html", {
        restaurantName: restaurant.restaurantName, // injected into {{restaurantName}} in the view
        menuItems, // injected into {{menuItems}} in the view
        cartItems: "<li class='empty'>Your cart is empty.</li>", // cart management not yet implemented
        totalPrice: "0.00", // no items in cart yet
        restaurantId, // injected into the hidden form field for order creation
        checkoutDisabled: "disabled", // disables Place Order until cart management is built
      });
    } catch {
      res.writeHead(HTTP_STATUS.TEMP_REDIRECT, { Location: "/login" }); // token missing or expired
      res.end();
    }
  },

  // serves GET /restaurant/register — static registration form for restaurant managers
  restaurantRegister: async (req, res) => {
    try {
      await sendHTML(res, "Restaurant-RegisterView.html");
    } catch {
      errorController(HTTP_STATUS.SERVER_ERROR, req, res);
    }
  },

  // serves GET /restaurant/login — static login form for restaurant managers
  restaurantLogin: async (req, res) => {
    try {
      await sendHTML(res, "Restaurant-LoginView.html");
    } catch {
      errorController(HTTP_STATUS.SERVER_ERROR, req, res);
    }
  },

  // serves GET /courrier/register — static registration form for couriers
  courrierRegister: async (req, res) => {
    try {
      await sendHTML(res, "Courrier-RegisterView.html");
    } catch {
      errorController(HTTP_STATUS.SERVER_ERROR, req, res);
    }
  },

  // serves GET /courrier/login — static login form for couriers
  courrierLogin: async (req, res) => {
    try {
      await sendHTML(res, "Courrier-LoginView.html");
    } catch {
      errorController(HTTP_STATUS.SERVER_ERROR, req, res);
    }
  },

  // serves GET /index.css — stylesheet for login and register pages
  styleIndex: async (req, res) => {
    try {
      await sendCSS(res, "index.css");
    } catch {
      errorController(HTTP_STATUS.SERVER_ERROR, req, res);
    }
  },

  // serves GET /error.css — stylesheet for all error pages
  styleError: async (req, res) => {
    try {
      await sendCSS(res, "error.css");
    } catch {
      errorController(HTTP_STATUS.SERVER_ERROR, req, res);
    }
  },

  // serves GET /dashboard.css — stylesheet for all dashboard pages
  styleDashboard: async (req, res) => {
    try {
      await sendCSS(res, "dashboard.css");
    } catch {
      errorController(HTTP_STATUS.SERVER_ERROR, req, res);
    }
  },
};
