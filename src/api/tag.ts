import express from 'express';
import TagService from '../services/tag';
import asyncHandler from '../utils/async_handle';
import Endpoint from '../submodule/common/endpoint';
import TTCSconfig from '../submodule/common/config'

const tagRouter = express.Router();
const tagService = new TagService();

tagRouter.post(Endpoint.GET_TAGS_BY_STATUS, asyncHandler(async (req, res) => {
    const data = await tagService.getTagsByStatus({status : Number(req.query.status)})
    return res.json({
        data,
        status : TTCSconfig.STATUS_SUCCESS
    })
}))

tagRouter.post(Endpoint.GET_TAGS_BY_ID_CATEGORY, asyncHandler(async (req, res) => {
    const data = await tagService.getByIdCategory({idCategory: req.query.idCategory, status : Number(req.query.status)})
    return res.json({
        data,
        status : TTCSconfig.STATUS_SUCCESS
    })
}))

tagRouter.post(Endpoint.UPDATE_TAG, asyncHandler(async (req, res) => {
    const data = await tagService.updateTag(req.body)
    return res.json(data)
}))

export { tagRouter };
