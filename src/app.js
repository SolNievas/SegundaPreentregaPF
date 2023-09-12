import express from "express";
import __dirname from "./utils.js";
import expressHandlebars from "express-handlebars";
import handlebars from "handlebars";
import { allowInsecurePrototypeAccess } from "@handlebars/allow-prototype-access";
import { Server } from "socket.io";
import mongoose from "mongoose";
import ProductManager from "./dao/ProductManager.js";
import ChatManager from "./dao/ChatManager.js";
import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import viewsRouter from "./routes/views.routes.js";

const app = express();
const puerto = 8080;
const httpServer = app.listen(puerto, () => {
  console.log("Servidor Activo en el puerto: " + puerto);
});
const socketServer = new Server(httpServer);
const productManager = new ProductManager();
const cartManager = new ChatManager();

app.set("views", __dirname + "/views");
app.engine(
  "handlebars",
  expressHandlebars.engine({
    handlebars: allowInsecurePrototypeAccess(handlebars),
  })
);
app.set("view engine", "handlebars");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use("/api/products/", productsRouter);
app.use("/api/carts/", cartsRouter);
app.use("/", viewsRouter);

mongoose.connect(
  "mongodb+srv://SolNievas:solnievas70@codecluster.zri7lyk.mongodb.net/ecommerce?retryWrites=true&w=majority"
);

socketServer.on("connection", (socket) => {
  console.log("Nueva Conexión!");

  const products = productManager.getProducts();
  socket.emit("realTimeProducts", products);

  socket.on("nuevoProducto", async (data) => {
    const product = {
      title: data.title,
      description: "",
      code: data.code,
      price: data.price,
      status: true,
      stock: 10,
      category: "",
      thumbnails: data.thumbnails,
    };
    await productManager.addProduct(product);
    const products = await productManager.getProducts();
    socket.emit("realTimeProducts", products);
  });

  socket.on("eliminarProducto", async (data) => {
    productManager.deleteProduct(parseInt(data));
    const products = await productManager.getProducts();
    socket.emit("realTimeProducts", products);
  });

  socket.on("newMessage", async (data) => {
    await cartManager.createMessage(data);
    const messages = await cartManager.getMessages();
    socket.emit("messages", messages);
  });
});
