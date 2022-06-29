import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import cors from "cors";
import fs from "fs";

import {
  registerValidation,
  loginValidation,
  postCreateValidation,
} from "./validations.js";

import { userController, postController } from "./controllers/index.js";

import { checkAuth, handleValidationsErrors } from "./utils/index.js";

mongoose
  .connect(
    "mongodb+srv://admin:wwwwww@cluster0.fupaj.mongodb.net/blog?retryWrites=true&w=majority" //подключаем базу данных
  )
  .then(() => console.log("DB ok"))
  .catch((err) => console.log("DB error", err));

const app = express();

//создаем хранилище для картинок постов
const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    if (!fs.existsSync("uploads")) {
      fs.mkdirSync("uploads");
    }
    cb(null, "uploads");
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });


app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

app.post(
  "/auth/login",
  loginValidation,
  handleValidationsErrors,
  userController.login
); //запрос на логин, сама функция в UserController
app.post(
  "/auth/register",
  registerValidation,
  handleValidationsErrors,
  userController.register
); //запрос на регистрацию, сама функция в UserController
app.get("/auth/me", checkAuth, userController.getMe); //запрос на получение данных, сама функция в UserController

app.post("/upload", checkAuth, upload.single("image"), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});


app.get("/tags", postController.getLastTags);
app.get("/posts", postController.getAll);
app.get("/posts/tags", postController.getLastTags);
app.post(
  "/posts",
  checkAuth,
  postCreateValidation,
  handleValidationsErrors,
  postController.create
);
app.get("/posts/:id", postController.getOne);
app.delete("/posts/:id", checkAuth, postController.remove);
app.patch(
  "/posts/:id",
  checkAuth,
  postCreateValidation,
  handleValidationsErrors,
  postController.update
);

app.listen(4444, (err) => {
  //слушаем нужный порт
  if (err) {
    console.log(err);
  }
  console.log("Server OK");
});
