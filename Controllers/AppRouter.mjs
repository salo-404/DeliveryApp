// import { authController } from "../controller/authController.mjs";
// import { pageController } from "../controller/pageController.mjs";
import { createRouter } from "./Router.mjs";

const router = createRouter();

// Pages
// router.add("GET", "/", pageController.home);
// router.add("GET", "/login", pageController.login);
// router.add("GET", "/home", pageController.userHome);

// // STYLING
// router.add("GET", "/index.css", pageController.style);
// router.add("GET", "/home.css", pageController.styleHome);
// router.add("GET", "/error.css", pageController.styleError);

// // Auth
// router.add("POST", "/auth/register", authController.register);
// router.add("POST", "/auth/login", authController.login);
// router.add("POST", "/auth/logout", authController.logout);

export const appRouter = router.dispatch;
