const router    = require("express").Router();
const c         = require("../controllers/adminController");
const adminAuth = require("../middleware/adminAuth");
const adminLoginLimiter = require("../middleware/adminLoginLimiter");
const seedGuard = require("../middleware/seedGuard");

/* public — admin login (rate limited) + seed (404 in production, secret header in development) */
router.post("/auth/login", adminLoginLimiter, c.login);
router.post("/auth/seed",  seedGuard, c.seedAdmin);

/* protected */
router.use(adminAuth);
router.get("/auth/me",                  c.me);
router.get("/stats",                    c.getStats);
router.get("/dashboard",                c.getDashboard);
router.get("/logs",                     c.getAdminLogs);
router.get("/users",                    c.getUsers);
router.post("/users",                   c.createUser);
router.get("/users/:id",                c.getUser);
router.put("/users/:id/subscription",   c.updateSubscription);
router.post("/users/:id/suspend",       c.suspendUser);
router.post("/users/:id/activate",      c.activateUser);
router.get("/users/:id/logs",           c.getUserLogs);

module.exports = router;
