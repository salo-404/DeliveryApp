# DeliveryApp

A food-delivery web application built with **vanilla Node.js** (no Express),
**MySQL**, and server-side session authentication.  Three types of users —
customers, restaurant managers, and couriers — interact through a shared order
lifecycle.

---

## Project Overview

### What the app does

| Actor | Can do |
|---|---|
| **Customer** | Register, log in, browse restaurants, build a cart, place and cancel orders |
| **Restaurant Manager** | Register, log in, manage their menu, view incoming orders, assign a courier |
| **Courier** | Register, log in, view assigned deliveries, update delivery status |

### Order lifecycle

```
Customer builds cart
       ↓
  Places order  →  status: Submitted
       ↓
Manager assigns courier  →  status: Preparing
       ↓
Courier picks up  →  status: On the way
       ↓
Courier delivers  →  status: Delivered
```

### Architecture

```
index.mjs
   └── http.createServer(appRouter)
          └── Router  (method + path → handler)
                 ├── Controllers  (parse request, call models/repos, send response)
                 ├── Models       (business logic — User, Order, Restaurant, …)
                 ├── Database     (singleton MySQL pool + all repositories)
                 └── Utils        (token, bodyParser, renderHTML, constants, …)
```

The server uses **no framework**.  Every HTTP concern — routing, body parsing,
cookie management, HTML templating — is implemented from scratch in the
`Utils/` and `Controllers/` layers.

---

## Prerequisites

- **Node.js** v18 or later — [nodejs.org](https://nodejs.org)
- **npm** (bundled with Node.js)
- **MySQL** 8.0 or later — running locally or in a container

Verify your versions before continuing:

```bash
node --version   # v18.x.x or higher
npm --version
mysql --version
```

---

## Required Libraries

All dependencies are declared in `package.json` and installed with one command.

| Package | Version | Purpose |
|---|---|---|
| `bcrypt` | ^6.0.0 | Password hashing and comparison |
| `dotenv` | ^17.4.2 | Loads `.env` variables into `process.env` |
| `mysql2` | ^3.20.0 | MySQL client with Promise support |
| `nodemon` | ^3.1.14 | Auto-restarts the server on file changes |
| `uuid` | ^13.0.0 | Generates unique IDs for orders, items, users |

---

## Installation Guide

**1. Clone the repository**

```bash
git clone <repository-url>
cd DeliveryApp
```

**2. Install dependencies**

```bash
npm install
```

**3. Create your database**

Log in to MySQL and create the schema the app will use:

```sql
CREATE DATABASE food_delivery;
```

The app runs `CREATE TABLE IF NOT EXISTS` for every table automatically on
startup — you do not need to run any migration scripts.

**4. Create your `.env` file**

Copy the template below into a new file named `.env` at the project root
(same level as `index.mjs`):

```
PORT=3000

JWT_SECRET=replace_this_with_a_long_random_string
JWT_EXPIRES_IN=1h

DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=food_delivery
DB_CONNECTION_LIMIT=10
DB_QUEUE_LIMIT=0
```

> The `.env` file is **git-ignored**.  Never commit real credentials.

**5. Start the server**

```bash
npm run start:app
```

Open your browser at `http://localhost:3000`.

---

## Configuration

Every variable the application reads from the environment is documented below.

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | Yes | — | Port the HTTP server listens on |
| `JWT_SECRET` | Yes | — | Secret used to sign session tokens |
| `JWT_EXPIRES_IN` | No | `1h` | Token lifetime (currently informational only) |
| `DB_HOST` | Yes | — | MySQL server hostname or IP |
| `DB_PORT` | Yes | — | MySQL server port (usually `3306`) |
| `DB_USER` | Yes | — | MySQL username |
| `DB_PASSWORD` | Yes | — | MySQL password |
| `DB_NAME` | Yes | — | Name of the database schema to use |
| `DB_CONNECTION_LIMIT` | No | `10` | Maximum simultaneous MySQL connections in the pool |
| `DB_QUEUE_LIMIT` | No | `0` | Maximum queued connection requests (`0` = unlimited) |

---

## Important Scripts

These are defined in `package.json` and run with `npm run <name>`.

| Script | Command | Use it when… |
|---|---|---|
| `start:app` | `nodemon ./index.mjs` | **Normal development** — starts the full server with auto-reload |
| `start:1` | `nodemon ./Database/Database.mjs` | Quickly test the database connection and schema creation in isolation |
| `start:2` | `nodemon ./Models/Customer.mjs` | Quickly test the Customer model in isolation |

> `nodemon` watches for file changes and restarts automatically.  You do not
> need to stop and re-run the server after editing a file.

---

## Project Structure

```
DeliveryApp/
├── index.mjs                      Entry point — creates the HTTP server
├── Controllers/
│   ├── AppRouter.mjs              Registers all routes
│   ├── Router.mjs                 Route matching and request dispatch
│   ├── AuthController.mjs         Customer register / login / logout
│   ├── PageController.mjs         Serves HTML pages and stylesheets
│   ├── OrderController.mjs        Cart management, order placement, cancellation
│   ├── CourrierController.mjs     Courier auth and delivery status updates
│   ├── RestaurantController.mjs   Manager auth, menu management, courier assignment
│   └── ErrorController.mjs        Renders error pages (400, 401, 404, 500)
├── Models/
│   ├── User.mjs                   Abstract base — register / login / logout
│   ├── Customer.mjs               Customer auth logic
│   ├── Courrier.mjs               Courier auth logic
│   ├── RestaurantManager.mjs      Manager auth logic
│   ├── Restaurant.mjs             In-memory menu helpers
│   ├── Order.mjs                  In-memory order helpers
│   ├── OrderItem.mjs              Menu item data holder
│   └── DeliveryAssignment.mjs     Creates and updates delivery assignments
├── Database/
│   ├── Database.mjs               Singleton MySQL connection pool + schema
│   ├── CustomerRepository.mjs     Customer CRUD
│   ├── CourrierRepository.mjs     Courier CRUD
│   ├── RestaurantManagerRepository.mjs  Manager CRUD
│   ├── RestaurantRepository.mjs   Restaurant and menu item CRUD
│   ├── OrderRepository.mjs        Order and cart CRUD
│   └── DeliveryAssignmentRepository.mjs  Assignment CRUD
├── Utils/
│   ├── constants.mjs              OrderStatus, UserRoles, HTTP_STATUS, limits
│   ├── token.mjs                  issueToken / verifyToken / revokeToken
│   ├── bodyParser.mjs             Reads and parses URL-encoded POST bodies
│   ├── renderHTML.mjs             Template rendering with {{placeholder}} syntax
│   ├── sendHTML.mjs               Sends a static HTML file
│   └── sendCSS.mjs                Sends a CSS file
├── Guard/
│   └── Guard.mjs                  Chainable auth/authorization guard (unused — student task)
├── Views/                         HTML templates and CSS stylesheets
├── Logs/                          Log files written at runtime (git-ignored)
└── Public/                        Static assets placeholder (git-ignored)
```

---

## Route Reference

| Method | Path | Handler | Access |
|---|---|---|---|
| `GET` | `/` | `pageController.login` | Public |
| `GET` | `/login` | `pageController.login` | Public |
| `GET` | `/register` | `pageController.register` | Public |
| `GET` | `/home` | `pageController.home` | Customer |
| `GET` | `/restaurant/menu?id=` | `pageController.restaurantMenu` | Customer |
| `POST` | `/auth/register` | `authController.register` | Public |
| `POST` | `/auth/login` | `authController.login` | Public |
| `POST` | `/auth/logout` | `authController.logout` | Customer |
| `POST` | `/cart/add` | `orderController.addToCart` | Customer |
| `POST` | `/order/create` | `orderController.create` | Customer |
| `GET` | `/order?id=` | `orderController.view` | Customer |
| `POST` | `/order/cancel` | `orderController.cancel` | Customer |
| `POST` | `/order/assign` | `restaurantController.assignCourier` | Manager |
| `GET` | `/restaurant/register` | `pageController.restaurantRegister` | Public |
| `GET` | `/restaurant/login` | `pageController.restaurantLogin` | Public |
| `GET` | `/restaurant/dashboard` | `restaurantController.dashboard` | Manager |
| `POST` | `/restaurant/register` | `restaurantController.register` | Public |
| `POST` | `/restaurant/login` | `restaurantController.login` | Public |
| `POST` | `/restaurant/logout` | `restaurantController.logout` | Manager |
| `POST` | `/restaurant/menu/add` | `restaurantController.addMenuItem` | Manager |
| `GET` | `/courrier/register` | `pageController.courrierRegister` | Public |
| `GET` | `/courrier/login` | `pageController.courrierLogin` | Public |
| `GET` | `/courrier/dashboard` | `courrierController.dashboard` | Courier |
| `POST` | `/courrier/register` | `courrierController.register` | Public |
| `POST` | `/courrier/login` | `courrierController.login` | Public |
| `POST` | `/courrier/logout` | `courrierController.logout` | Courier |
| `POST` | `/courrier/status` | `courrierController.updateStatus` | Courier |

---

## Student Continuation

## What Was Implemented

### 1. `Logger` Class — `Utils/Logger.mjs`
A structured logging utility with levels (`DEBUG`, `INFO`, `WARN`, `ERROR`) that writes timestamped messages to the console and to `Logs/app.log`.

### 2. `Config` Class — `Utils/Config.mjs`
A singleton that reads all environment variables at startup, validates required ones, and exposes them as typed properties — replacing raw `process.env.*` calls across the codebase.

### 3. `logout()` on User Subclasses
`Customer`, `Courrier`, and `RestaurantManager` all override the abstract `logout()` from `User` to revoke the session token and clear the cookie.

### 4. UI/UX Enhancements
- Enhanced **Login** page
- Enhanced **Dashboard** for customers, managers, and couriers
- Styled **Error** pages (400, 401, 404, 500)

---

## UI Preview

### Login Page
("<img width="1532" height="793" alt="image" src="https://github.com/user-attachments/assets/1aef5e03-c70e-4149-af06-67093ae77ee6" />
 

### Customer Dashboard
<img width="1874" height="799" alt="image" src="https://github.com/user-attachments/assets/d3faef46-bccf-4f5b-828b-e71974d83067" />


### Restaurant Dashboard
<img width="1876" height="923" alt="image" src="https://github.com/user-attachments/assets/47eac1f2-e6e1-400e-9ad9-b19af0bf9be2" />

<img width="1874" height="959" alt="image" src="https://github.com/user-attachments/assets/ee1a38a7-a144-459c-8a5e-967a636f25b8" />


### Courier Dashboard
img width="1881" height="952" alt="image" src="https://github.com/user-attachments/assets/5dec9e23-4117-4dd5-997d-cd5965535dc2" />


### Error Page
<img width="1126" height="831" alt="image" src="https://github.com/user-attachments/assets/a7e37e34-0927-48f9-9c13-4f43622fde76" />


---

| **Customer** | Register, log in, browse restaurants, build a cart, place and cancel orders |
| **Restaurant Manager** | Register, log in, manage their menu, view incoming orders, assign a courier |
| **Courier** | Register, log in, view assigned deliveries, update delivery status |

