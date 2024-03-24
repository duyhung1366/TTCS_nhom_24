import mongoose, { Document, Model, model, Types } from "mongoose";
// import { departmentTable } from "./departments";
import { UserInfo } from '../submodule/models/user';
export const userTableName = "User";
interface IUserSchema extends Model<UserInfoDoc> {

}
export interface UserInfoDoc extends UserInfo, Document {
    _id: string;
}

const UserSchema = new mongoose.Schema<UserInfoDoc, IUserSchema>(
    {
        account: { type: String, lowercase: true },
        name: String,
        avatar: String,
        email: String,
        password: String,
        classNumber: Number,
        progess: [{
            idTopic: {
                type: mongoose.Types.ObjectId, 
                ref: "Topic"
            },
            status: Number,
            timeStudy: Number,
            score: Number,
            correctQuestion: Number,
            answers: [{
                idQuestion : String, 
                idAnswer: String
            }]
        }],
        phoneNumber: { type: String, default: '' },
        address: { type: String, default: '' },
        facebookId: { type: String, default: '' },
        birth: { type: Number, default: 0 },
        gender: { type: Number, default: 0 },
        registerDate: { type: Number, default: 0 },
        status: { type: Number, default: 1 },
        userRole: {type: Number, default: 1},
        lastLogin: { type: Number, default: 0 },
        verification_code: String, 
        verification_created_at: Number
    },
    {
        versionKey: false,
        timestamps: true,
    }
);



export const UserModel = model(userTableName, UserSchema);

