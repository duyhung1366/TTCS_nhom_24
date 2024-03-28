import { Router } from "express";
import moment from "moment";
import { UserModel } from "../../database/users";
import SendMailService from "../../services/sendMail";
import TTCSconfig from "../../submodule/common/config";
import { UserInfo } from "../../submodule/models/user";
import { encodeSHA256Pass } from "../../submodule/utils/crypto";
import async_handle from "../../utils/async_handle";
import { generateCode } from "../../utils/generateCode";
import { jwtEncode } from "../../utils/jwtToken";
import { jwtMiddleware } from "./middleware";
import logger from "../../utils/logger";

const sendMailService = new SendMailService();
const router = Router();

router.post("/login", async_handle(async (req, res) => {
    const { account, password, email } = req.body

    const queryUser: any[] = []
    if (typeof account !== "undefined") queryUser.push({ account })
    if (typeof email !== "undefined") queryUser.push({ email })
    const user = await UserModel.findOne({
        $or: queryUser, status: TTCSconfig.STATUS_PUBLIC
    })
    if (!user || !user.account) {
        return res.status(200).json({
            status: TTCSconfig.STATUS_FAIL,
            token: "-1" // không tồn tại
        })
    }

    const encodedPassword = encodeSHA256Pass(user.account, password);

    if (encodedPassword !== user.password) {
        return res.status(200).json({
            status: TTCSconfig.STATUS_FAIL,
            token: "1" // sai password
        })
    }
    const token = jwtEncode(user._id);
    await UserModel.findByIdAndUpdate(user._id, { $set: { lastLogin: Date.now() } })

    return res.json({
        status: TTCSconfig.STATUS_SUCCESS,
        token
    })
}))

router.post("/session", jwtMiddleware, async_handle(async (req, res) => {
    return res.status(200).json({})
}))

router.post("/register", async_handle(async (req, res) => {
    const { account, password, email, phoneNumber, gender, reTypePassword, name } = req.body as Partial<UserInfo> & { reTypePassword?: string }
    if (!account || !password || !email || !phoneNumber || !gender || !name) {
        return res.status(400).json("params is not valid")
    }
    if (reTypePassword && reTypePassword !== password) return res.status(400).json("params is not valid")

    const isExistUser = await UserModel.exists({
        $or: [
            { account },
            { email }
        ]
    })
    if (isExistUser) return res.status(200).json({
        status: TTCSconfig.LOGIN_ACCOUNT_IS_USED,
        token: null
    })
    const registerUser = await UserModel.create({
        ...req.body,
        password: encodeSHA256Pass(account, password),
        registerDate: Date.now()
    })
    const token = jwtEncode(registerUser._id);
    return res.json({
        status: TTCSconfig.STATUS_SUCCESS,
        token
    })
}))

router.post("/user", jwtMiddleware, async_handle(async (req, res) => {
    const { _id } = req.body;
    const user = await UserModel.findOne({ _id });

    return res.json(user)
}))

router.post("/update-user", async_handle(async (req, res) => {
    const { _id, password, ...updateFeild } = req.body;
    let _password: string | null = "";
    const user = await UserModel.findOne({ _id })
    if (!user) return res.json({ status: TTCSconfig.STATUS_NO_EXIST })

    if (password) {
        _password = encodeSHA256Pass(user.account, password)
        if (!_password) return res.json({ status: TTCSconfig.STATUS_FAIL })
        Object.assign(updateFeild, { password: _password })
    }
    await UserModel.findOneAndUpdate(
        { _id },
        { $set: { ...updateFeild } },
    )
    return res.json({
        status: TTCSconfig.STATUS_SUCCESS
    })
}))

router.post("/send-code-reset-pass", async_handle(async (req, res) => {
    const { email, account } = req.body
    const queryUser: any[] = []
    if (typeof account !== "undefined") queryUser.push({ account })
    if (typeof email !== "undefined") queryUser.push({ email })
    logger.debug("query user : ", queryUser, { account }, {email})
    const user = await UserModel.findOne({
        $or: queryUser, status: TTCSconfig.STATUS_PUBLIC
    })
    logger.debug("[send code]: user", user?._id)
    if (!user || !user.email) {
        return res.status(200).json({
            status: TTCSconfig.STATUS_NO_EXIST,
        })
    }
    const code = generateCode(6);
    const currentTime = moment().valueOf();

    const [_, data] = await Promise.all([
        UserModel.findOneAndUpdate({
            _id: user._id
        }, {
            $set: {
                verification_code: code,
                verification_created_at: currentTime
            }
        }).exec(),
        sendMailService.sendMailWithMailjet({
            fromEmail: process.env.EMAIL_SUPPORT || "hungnguyen13.t@gmail.com",
            toEmail: user.email,
            content: `<div style="color: black;">
                <h2>Đây là mã code của bạn : </h2>
                <p style="color: red">${code}</p>
                <p style="font-style: italic;">mã code có thời hạn trong 5p, vui lòng không chia sẻ mã code cho người khác</p>
            </div>`,
            subject: "test send mail service"
        })
    ])
    return res.json(data)
}))

router.post("/reset-pass-word", async_handle(async (req, res) => {
    const { code, email, account, newPwd } = req.body;
    const queryUser: any[] = []
    if (typeof account !== "undefined") queryUser.push({ account })
    if (typeof email !== "undefined") queryUser.push({ email })
    const user = await UserModel.findOne({
        $or: queryUser, status: TTCSconfig.STATUS_PUBLIC
    })
    if (!user || !user.email || !user.account) {
        return res.status(200).json({
            status: TTCSconfig.STATUS_NO_EXIST,
        })
    }
    if(user.verification_code !== code) { 
        return res.json({
            status: TTCSconfig.STATUS_FAIL,
            message: 'Mã code không chính xác'
        })
    }
    if(moment(user.verification_created_at || 0).add(5, "minutes").isBefore(moment())) {
        return res.json({
            status:TTCSconfig.STATUS_FAIL,
            message: 'Mã code hết hạn'
        })
    }

    await UserModel.findOneAndUpdate({
        _id: user._id
    }, { 
        $set: { 
            password: encodeSHA256Pass(user.account, newPwd)
        }, 
        $unset: {
            verification_code: "",
            verification_created_at: ""
        }
    })

    return res.json({ 
        status: TTCSconfig.STATUS_SUCCESS
    })

}))

export { router as authRouter };
