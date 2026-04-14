import "dotenv/config"; // loads .env variables into process.env
import http from "node:http"; // built-in Node.js HTTP module, no frameworks


const PORT = process.env.PORT; // reads PORT from .env
console.log(PORT)

const server = http.createServer(appRouter); // appRouter is NOT defined or imported yet — this will crash

server.listen(PORT, () => {
  console.log(`Server running on PORT:${PORT}`); // confirms server started successfully
});
