import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-beautiful-unique-validation';


export const fileSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    path: { type: String, required: true },
    size: { type: Number, required: true },
    uuid: { type: String, required: true },
    sender: { type: String, required: false },
    receiver: { type: String, required: false },
}, { timestamps: true });

fileSchema.plugin(uniqueValidator);
export const fileModel= mongoose.model('File', fileSchema);
