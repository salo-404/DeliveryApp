import "dotenv/config";
import http from "node:http";
import { appRouter } from "./Controllers/AppRouter.mjs";

const PORT = process.env.PORT;


const server = await http.createServer(appRouter);

server.listen(PORT, () => {
  console.log(`Server running on PORT:${PORT}`);
});
