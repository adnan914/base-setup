import mongoose, { Schema } from 'mongoose';

const CategorySchema: Schema = new Schema({
    catrgory_name: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

export default mongoose.model('category', CategorySchema);
