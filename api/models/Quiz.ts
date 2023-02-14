import {Schema, model, Document} from 'mongoose';

export interface IQuiz extends Document{
    filename: string;
    date: string;
    unique_id: string;
    user_id: string;
    answers: [{username: string, answer: string}];
}

const quizSchema = new Schema<IQuiz>({
    filename: {type: String, required: true},
    date: {type: String, required: true},
    unique_id: {type: String, required: true},
    answers: {type: [{username: String, answer: String}]},
    user_id: {type: String}
});

export default model("Quiz", quizSchema);