import mongoose, { Schema } from 'mongoose';


const BlogsSchema: Schema = new Schema({
    title: { type: String, required: true, unique: true },
    blog_image_url: { type: Boolean, default: false },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});



export default mongoose.model('blogs', BlogsSchema);