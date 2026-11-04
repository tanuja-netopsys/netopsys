const express = require("express");
const router = express.Router();
const permissionController = require("../controllers/permissionController");

// Mount endpoints
router.get("/", permissionController.getPermissions);
router.post("/", permissionController.updatePermissions);
router.put("/", permissionController.updatePermissions);
router.post("/reset", permissionController.resetPermissions);

// User & Role creation endpoints
router.get("/users", permissionController.getUsers);
router.post("/users", permissionController.createUser);
router.put("/users/:id", permissionController.updateUser);
router.put("/users", permissionController.updateUser);
router.delete("/users/:id", permissionController.deleteUser);
router.post("/create-user", permissionController.createUser);
router.post("/roles", permissionController.createRole);
router.post("/create-role", permissionController.createRole);

module.exports = router;

