import mongoose, { Schema } from 'mongoose';

const RefreshTokenSchema: Schema = new Schema({
    token: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    used: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now, expires: process.env.JWT_REFRESH_EXPIRATION },
});



export default mongoose.model('refresh_token', RefreshTokenSchema);