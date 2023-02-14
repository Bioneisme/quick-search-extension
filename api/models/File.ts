import {Schema, model, Document} from 'mongoose';

export interface IFile extends Document{
    filename: string;
    pages: number;
    text: [string];
}

const fileSchema = new Schema<IFile>({
    filename: {type: String, required: true},
    pages: {type: Number, required: true},
    text: {type: [String], required: true}
});

export default model("File", fileSchema);