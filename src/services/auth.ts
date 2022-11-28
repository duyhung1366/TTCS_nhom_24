import TTCSconfig from "../submodule/common/config";
import { UserInfo } from "../submodule/models/user";
import { UserModel } from "../models/mongo/users";
import { decrypt, encodeSHA256Pass } from "../utils/crypto";
import { jwtEncode } from "../utils/jwtToken";

class AuthServices {
    processPass(userObject: {
        account: string;   
        password: string;
    }) {
        const decryptedResult = decrypt(userObject.password);
        const { 1: newPass } = decryptedResult.split("_");
        if (newPass) {
            const encodedPassword = encodeSHA256Pass(userObject.account, newPass);
            return encodedPassword;
        }
        return undefined; // throw error ?
    }
    login = async (body: { account: string, password: string }): Promise<UserInfo> => {
        let newPass = this.processPass(body);


        let userInfo = new UserInfo({ ...body, password: newPass });
        if (newPass) {
            userInfo.password = newPass;
            let checkUserAcc: UserInfo | null = await UserModel.findOne({ account: userInfo.account });
            if (checkUserAcc) {
                if (newPass === checkUserAcc.password) {
                    userInfo = new UserInfo(checkUserAcc);
                    userInfo.loginCode = TTCSconfig.LOGIN_SUCCESS;
                } else {
                    userInfo.password = "";
                    userInfo.loginCode = TTCSconfig.LOGIN_WRONG_PASSWORD;
                }
            } else {
                userInfo.loginCode = TTCSconfig.LOGIN_ACCOUNT_NOT_EXIST;
            }
        } else {
            userInfo.loginCode = TTCSconfig.LOGIN_WRONG_PASSWORD;
        }
        return userInfo;
    }
    register = async (body: UserInfo): Promise<UserInfo> => {
        let userInfo = new UserInfo(body);
        try {
            const account = userInfo.account?.trim().toLowerCase();
            const password = userInfo.password;
            const checkUserAcc: UserInfo | null = await UserModel.findOne({ account });
            if(!checkUserAcc) {
                const plainPwd= decrypt(password);
                // encode password 
                const passEncode = encodeSHA256Pass(account, plainPwd) ;
                // luu vao db
                const newUser = await UserModel.create({
                    ...userInfo, 
                    password: passEncode,
                    registerDate: Date.now(),
                    status: TTCSconfig.UserStatus.NORMAL, 
                    lastLogin: Date.now()
                })
                const token = jwtEncode(newUser?._id, 2592000);
                return {
                    ...newUser, password: '', loginCode: TTCSconfig.LOGIN_SUCCESS, token
                  };
            }
                return {...userInfo , loginCode : TTCSconfig.LOGIN_ACCOUNT_IS_USED}
        }catch (err) {
            userInfo.loginCode = TTCSconfig.LOGIN_FAILED;
        }

        return userInfo;
    }
}
export { AuthServices };
