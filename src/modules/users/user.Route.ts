import express from "express";
import { userControllers } from "./user.Controller";
import auth from "../../middleware/auth";

const router = express.Router();

router.post('/auth/signup', userControllers.signUp);
router.post("/auth/signin", userControllers.signIn);
router.get("/users",auth("admin"), userControllers.getAllUsers);
router.patch("/users/:id", auth("admin", "customer"),userControllers.updateUser);
router.delete("/users/:id",auth("admin"), userControllers.deleteUser);

export const usersRouter = router;