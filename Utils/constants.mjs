// HERE we put the constants that we stay like this across all files of the application
// They should not be affected by the development environment or device.

export const OrderStatus = Object.freeze({
  DELIVERED: "Delivered",
  ONTHEWAY: "On the way",
  PREPARING: "Preparing",
  SUBMITTED: "Submitted",
  INCOMPLETE: "Incomplete Cart",
});

export const UserRoles = Object.freeze({
  CUSTOMER: "Customer",
  COURRIER: "Courrier",
  MANAGER: "Manager",
});

export const SALT_ROUNDS = 10;

export const OrderLimits = Object.freeze({
  MAX_ITEMS_PER_ORDER: 20,
  MAX_ACTIVE_ORDERS: 5,
});

export const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATE: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
});
