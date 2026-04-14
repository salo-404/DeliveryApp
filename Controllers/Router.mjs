import path from "node:path";
import { fileURLToPath } from "node:url";
// import { errorController } from "../controller/errorController.mjs";

const __dirName = path.dirname(fileURLToPath(import.meta.url));

export class Router {
  #routes = [];

  add(method, path, handler) {
    this.#routes.push({ method: method.toUpperCase(), path, handler });
  }

  #notFound(req,   res) {
    errorController(404, req, res);
  }

  dispatch = async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;
    const method = req.method;

    const match = this.#routes.find(
      (route) => route.method === method && route.path === pathname
    );

    const handler = match ? match.handler : this.#notFound;

    try {
      await handler(req, res);
    } catch (error) {
      console.log(error);
      errorController(500, req, res);
    }
  };
}

export function createRouter() {
  return new Router();
}