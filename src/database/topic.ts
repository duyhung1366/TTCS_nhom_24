import mongoose, { Document, Model, model } from "mongoose";
import { Topic } from "../submodule/models/topic";
export const topicTable = "Topic";
interface ITopicSchema extends Model<TopicDoc> {

}

export interface TopicDoc extends Topic, Document {
    id: string;
}

const TopicSchema = new mongoose.Schema<TopicDoc, ITopicSchema>(
    {
        name: String,
        status: Number,
        idCourse: String,
        topicChild: {
            type: [mongoose.Types.ObjectId],
            ref: topicTable
        },
        parentId: {
            type: mongoose.Types.ObjectId, 
            ref: topicTable
        },
        createDate: {type: Number, default: Date.now()},
        updateDate: {type: Number, default: Date.now()},
    },
    {
        versionKey: false,
        timestamps: true,
    }
);

export const TopicModel = model(topicTable, TopicSchema);