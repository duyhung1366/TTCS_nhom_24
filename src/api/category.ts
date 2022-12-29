import express from 'express';
import CategoryService from '../services/category';
import asyncHandler from '../utils/async_handle';
import Endpoint from '../submodule/common/endpoint';
import TTCSconfig from '../submodule/common/config'

const categoryRouter = express.Router();
const categoryService = new CategoryService();

categoryRouter.post(Endpoint.GET_CATEGORYS_BY_STATUS, asyncHandler(async (req, res) => {
    const data = await categoryService.getCategorysByStatus({status : Number(req.query.status)})
    return res.json({
        data,
        status : TTCSconfig.STATUS_SUCCESS
    })
}))

categoryRouter.post(Endpoint.UPDATE_CATEGORY, asyncHandler(async (req, res) => {
    const data = await categoryService.updateCategory(req.body)
    return res.json(data)
}))

export { categoryRouter };