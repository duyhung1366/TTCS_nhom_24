import { BadRequestError } from "../common/errors";
import { CourseModel } from "../database/course";
import TTCSconfig from "../submodule/common/config";
import { Course } from "../submodule/models/course";

export default class CourseService {
    // get 
    getCoursesByStatus = async (body: {status: number}): Promise<Course[]> => {
        try {
            const courses = await CourseModel.find({status: body.status})
            return courses
        } catch (error) {
            throw new BadRequestError();
        }
    }

    // get by id category
     getCoursesByIdCategory = async (body: {idCategory: any, status: number}) => {
        try {
            const courses = await CourseModel.find({idCategory: body.idCategory, status: body.status})
            return courses
        } catch (error) {
            throw new BadRequestError();
        }
    }
     
    // get by id tag or category
    getByIdTagAndCategory = async (body: {idCategory: any, idTag: any, status: number}): Promise<Course[]> => {
        try {
            if(body.idTag && body.idCategory) {
                const courses = await CourseModel.find({idTag: body.idTag, idCategory: body.idCategory, status: body.status})
                return courses
            }else if(body.idCategory) {
                const courses = await CourseModel.find({idCategory: body.idCategory, status: body.status})
                return courses
            }else {
                const courses = await CourseModel.find({idTag: body.idTag, status: body.status})
                return courses
            }
        } catch (error) {
            throw new BadRequestError();
        }
    }

    getCoursesBySlug = async (body: {slug: string}) => {
        try {
            const course = await CourseModel.find({
                slug: body.slug
            })
            return course
        } catch (error) {
            throw new BadRequestError();
        }
    }

    // update and create
    updateCourse = async (body: Course): Promise<{
        data: Course | string,
        status: number 
    }> => {
        if (body?.id) {
            // update
            try {
                const courses = await CourseModel.findOneAndUpdate(
                    { _id: body?.id },
                    {
                        $set: {
                            ...body,
                            updateDate: Date.now()
                        }
                    },
                    { new: true }
                );
                if(courses) {
                    return {
                        data: courses, 
                        status: TTCSconfig.STATUS_SUCCESS
                    }
                } else {
                    return {
                        data: 'không tồn tại' , 
                        status: TTCSconfig.STATUS_NO_EXIST
                    }
                }
            } catch (error) {
                throw new BadRequestError();
            }
        } else {
            // create
            try {
                const newCourse = await CourseModel.create({
                    ...body,
                    createDate: Date.now(),
                    updateDate: Date.now(),
                })
                return {
                    data: newCourse, 
                    status: TTCSconfig.STATUS_SUCCESS
                }
            } catch (error) {
                throw new BadRequestError();
            }
        }
    }
}