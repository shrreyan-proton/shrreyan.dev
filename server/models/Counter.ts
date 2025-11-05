import mongoose, { Schema, Document } from "mongoose";

export interface ICounter extends Document {
  _id: string;
  seq: number;
}

const CounterSchema = new Schema<ICounter>({
  _id: { type: String, required: true },
  seq: { type: Number, required: true },
});

export const Counter = mongoose.model<ICounter>("Counter", CounterSchema);

export async function getNextUserId(): Promise<number> {
  const counter = await Counter.findByIdAndUpdate(
    { _id: "userId" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  
  if (!counter) {
    const newCounter = await Counter.create({ _id: "userId", seq: 99 });
    return getNextUserId();
  }
  
  return counter.seq;
}

export async function initializeUserIdCounter(): Promise<void> {
  const existing = await Counter.findById("userId");
  if (!existing) {
    await Counter.create({ _id: "userId", seq: 99 });
  }
}
