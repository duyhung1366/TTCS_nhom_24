import { BadRequestError } from "../common/errors";
import { TopicModel } from "../database/topic";
import TTCSconfig from "../submodule/common/config";
import { Topic } from "../submodule/models/topic"

export default class TopicService {
    // get 
    getTopicsByStatus = async (body: { status: number }): Promise<Topic[]> => {
        try {
            const topics = await TopicModel.find({ status: body.status })
            return topics
        } catch (error) {
            throw new BadRequestError();
        }
    }
    // get by id category
    getTopicsByIdCourse = async (body: {idCourse: any, type: number}):Promise<Topic[]> => {
        try {
            const topics = await TopicModel.find({idCourse: body.idCourse, type: body.type, parentId: null})
            return topics
        } catch (error) {   
            throw new BadRequestError();
        }
    }
    // get by id category
    getTopicsByParentId = async (body: {parentId: any})  => {
        try {
            const topics = await TopicModel.find({parentId: body.parentId})
            return topics
        } catch (error) { 
            throw new BadRequestError();
        }
    }

    getTopicsByCourse = async (body: {
        idCourse: string,
        type: number,
        parentId: string | null
    }) => {
        try {
            const data = await TopicModel.find({
                idCourse: body.idCourse,
                parentId: body.parentId,
                type: body.type,
            })
            return data
        } catch (error) {
            throw new BadRequestError();
        }
    }
    // update and create
    updateTopic = async (body: Topic) => {
        if (body?.id) {
            // update
            try {
                const topics = await TopicModel.findOneAndUpdate(
                    { _id: body?.id },
                    {
                        $set: {
                            ...body,
                            updateDate: Date.now()
                        }
                    },
                    { new: true }
                );
                if (topics) {
                    return {
                        data: topics,
                        status: TTCSconfig.STATUS_SUCCESS
                    }
                } else {
                    return {
                        data: 'không tồn tại',
                        status: TTCSconfig.STATUS_NO_EXIST
                    }
                }
            } catch (error) {
                throw new BadRequestError();
            }
        } else {
            // create
            try {
                const newUser = await TopicModel.create({
                    ...body,
                    createDate: Date.now(),
                    updateDate: Date.now(),
                })
                return {
                    data: newUser,
                    status: TTCSconfig.STATUS_SUCCESS
                }
            } catch (error) {
                throw new BadRequestError();
            }
        }
    }

    orderTopic = async (body: {
        indexRange: Array<{
            id: string,
            index: number
        }>
    }) => {
        try {
            const idRange = body.indexRange.map(o => o.id)
            const loadTopic = await TopicModel.find({ "_id": idRange })

            const orderTopic = loadTopic.map(topic => new Topic(topic)).map(topic => {
                return {
                    ...topic,
                    index: body?.indexRange?.find(o => o.id === topic.id?.toString())?.index || 0
                }
            })

            const data = await Promise.all(orderTopic.map(order => {
                return TopicModel.findOneAndUpdate(
                    { _id: order?.id },
                    {
                        $set: {
                            ...order,
                            updateDate: Date.now()
                        }
                    },
                    { new: true }
                )
            }))

            return {
                status: TTCSconfig.STATUS_SUCCESS
            }
        } catch (error) {
            throw new BadRequestError();
        }
    }
}