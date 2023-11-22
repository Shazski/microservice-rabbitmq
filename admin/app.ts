import express, { Request, Response } from "express";
import dontenv from "dotenv";
import cors from "cors";
import { connect } from "./config/db";
import ProductModel from "./Models/ProductModel";
import ampq, { Connection } from "amqplib/callback_api";
import { Channel } from "amqplib";
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
  (error, connection: Connection) => {

    if (error) throw new Error(error);

    connection.createChannel((error, channel: Channel) => {

      if (error) throw new Error(error);

      app.get("/api/products", async (req: Request, res: Response) => {
        const products = await ProductModel.find();
        res.json(products);
      });

      app.post("/api/products", async (req: Request, res: Response) => {
        const product = await ProductModel.create({ ...req.body });
        channel.sendToQueue(
            "product_created",
            Buffer.from(JSON.stringify(product))
          );
        res.json(product);
      });

      app.get("/api/products/:id", async (req: Request, res: Response) => {
        // Fetch product by ID from database
        const product = await ProductModel.findById(req.params.id);
        // Return product data as JSON response
        res.json(product);
      });

      app.put("/api/products/:id", async (req: Request, res: Response) => {
        // Find and update product
        const product = await ProductModel.findByIdAndUpdate(req.params.id, {
          ...req.body,
        });
        channel.sendToQueue(
          "product_updated",
          Buffer.from(JSON.stringify(product))
        );
        // Return updated product
        res.json(product);
      });
      
      app.delete("/api/products/:id", async(req: Request, res: Response) => {
      // Find and delete product
     const product = await ProductModel.findByIdAndDelete(req.params.id)
     channel.sendToQueue("product_deleted",Buffer.from(req.params.id))
        res.json({message:"product successfully deleted"} as {message:string})
    });

    app.post("/api/products/:id/like", async (req: Request, res: Response) => {
      const product = await ProductModel.findById(req.params.id);
      product.likes += 1;
      await product.save();
      res.json(product);
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
