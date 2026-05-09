import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Config from "./Config.mjs";

const __dirName = path.dirname(fileURLToPath(import.meta.url));

// Log levels in ascending severity order.
// Only messages at or above the configured level will be written.
const LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };

export default class Logger {
  #level;
  #logFile;

  constructor() {
    const config = Config.getInstance();
    this.#level = config.logLevel;

    // Keep one append-only log file for the whole application.
    const logsDir = path.join(__dirName, "..", "Logs");
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    const logPath = path.join(logsDir, "app.log");
    this.#logFile = fs.createWriteStream(logPath, { flags: "a" });
  }

  #write(level, message) {
    if (LEVELS[level] < LEVELS[this.#level]) return;
    const formatted = `[${new Date().toISOString()}] [${level}]  ${message}`;
    // Mirror the same line to the terminal and the log file.
    console.log(formatted);
    this.#logFile.write(formatted + "\n");
  }

  debug(message) {
    this.#write("DEBUG", message);
  }

  info(message) {
    this.#write("INFO", message);
  }

  warn(message) {
    this.#write("WARN", message);
  }

  error(message) {
    this.#write("ERROR", message);
  }
}

// Export a single shared instance so all files use the same log file.
export const logger = new Logger();
