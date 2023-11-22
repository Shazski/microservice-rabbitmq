import express, { Request, Response } from "express";
import dontenv from "dotenv";
import cors from "cors";
import { connect } from "./config/db";
import Product, { IProductModel } from "./models/Product";
import ampq, { Channel } from "amqplib/callback_api";
import { json } from "node:stream/consumers";
const app = express();
dontenv.config();
const PORT = process.env.PORT;
app.use(
  cors({
    origin: "https://localhost:5173",
  })
);
connect();
app.use(express.json());
ampq.connect(
    process.env.RABBITMQ_URL,
  (err, connection) => {
    if (err) throw new Error(err);

    connection.createChannel((err: any, channel: Channel) => {
      if (err) throw new Error(err);
      channel.assertQueue("product_created", { durable: false });
      channel.assertQueue("product_updated", { durable: false });
      channel.assertQueue("product_deleted", { durable: false });
      
      channel.consume("product_created", async(msg) => {
        const eventProduct:IProductModel = JSON.parse(msg.content.toString())
        const userProduct = await Product.create({
            adminId:eventProduct._id,
            ...eventProduct
        })
        console.log("product created")
      },{noAck: true});
      channel.consume("product_updated", (msg) => {
        console.log(msg.content.toString());
      });
      channel.consume("product_deleted", (msg) => {
        console.log(msg.content.toString());
      });

      app.listen(PORT, () => {
        console.log(`server connected to port ${PORT}`);
      });
      process.on("beforeExit", () => {
        console.log("closing");
        connection.close();
      });
    });
  }
);
