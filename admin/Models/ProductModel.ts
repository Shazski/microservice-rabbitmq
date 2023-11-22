import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export interface IProductModel extends Document {
  title: string | null;
  image: string | null;
  likes: number | null;
  _id: ObjectId;
}

const ProductModelSchema: Schema = new Schema({
  title: { type: String },
  image: { type: String },
  likes: { type: Number },
});

const ProductModel = mongoose.model<IProductModel>('ProductModel', ProductModelSchema);

export default ProductModel;

