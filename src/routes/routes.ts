import { Router } from "express";
import { getUsers, getUserbyId, createUser, updateUser, deleteUser } from "../controller/UserController"

export const router = Router();

router.get('/users', getUsers);
router.get('/users/:id', getUserbyId);
router.post('users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users:id', deleteUser);

