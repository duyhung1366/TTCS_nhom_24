import express from 'express';
import CourseService from '../services/course';
import asyncHandler from '../utils/async_handle';
import Endpoint from '../submodule/common/endpoint';
import TTCSconfig from '../submodule/common/config'
import { Course } from '../submodule/models/course';

const courseRouter = express.Router();
const courseService = new CourseService();

courseRouter.post(Endpoint.GET_COURSES_BY_STATUS, asyncHandler(async (req, res) => {
    const data = await courseService.getCoursesByStatus({status : Number(req.query.status)})
    return res.json({
        data,
        status : TTCSconfig.STATUS_SUCCESS
    })
}))

courseRouter.post(Endpoint.GET_COURSES_BY_ID_TAG_AND_CATEGORY, asyncHandler(async (req, res) => {
    const data = await courseService.getByIdTagAndCategory({idCategory: req.query.idCategory, idTag: req.query.idTag, status : Number(req.query.status)})
    return res.json({
        data,
        status : TTCSconfig.STATUS_SUCCESS
    })
}))

courseRouter.post(Endpoint.GET_COURSE_BY_SLUG, asyncHandler(async (req, res) => {
    const data = await courseService.getCoursesBySlug({
        slug: `${req.query.slug || ''}`
    })
    return res.json({
        data, 
        status : TTCSconfig.STATUS_SUCCESS
    })
}))

courseRouter.post(Endpoint.UPDATE_COURSE, asyncHandler(async (req, res) => {
    const data = await courseService.updateCourse(new Course(req.body))
    return res.json(data)
}))

export { courseRouter };
