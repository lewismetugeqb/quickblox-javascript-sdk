import QB from "quickblox/quickblox.min.js";

/** Importing QBconfig */
import { AppConfig, CONSTANTS } from "./../QBconfig.json";

/** Importing Services */
import Helpers from "./Helpers.jsx";
import Users from "./Users.jsx";

class Dialog {

    static limit = AppConfig.dilogsPerRequers || 30;
    static prevDialogId = null;
    static dialogId = null;
    static _cache = {};

    static loadDialogs(type, skip) {
            let filter = {
                limit: this.limit,
                skip: skip,
                sort_desc: "updated_at"
            };

        return new Promise((resolve, reject) => {
            if (type === 'chat') {
                filter['type[in]'] = [CONSTANTS.DIALOG_TYPES.CHAT, CONSTANTS.DIALOG_TYPES.GROUPCHAT].join(',');
            } else {
                filter.type = CONSTANTS.DIALOG_TYPES.PUBLICCHAT;
            }

            QB.chat.dialog.list(filter, (err, resDialogs) => {
                if (err) {
                    reject(err);
                }
                resolve(resDialogs);
            });
        });
    }

    static joinToDialog(jidOrUserId) {
        return new Promise((resolve, reject) => {
            QB.chat.muc.join(jidOrUserId, (resultStanza) => {
                for (let i = 0; i < resultStanza.childNodes.length; i++) {
                    let elItem = resultStanza.childNodes.item(i);
                    if (elItem.tagName === 'error') {
                        return reject({error: true, joined: false});
                    }
                }
                resolve({joined: true});
            });
        });
    }

    static getDialogById(id) {
        return new Promise(function(resolve, reject){
            if (!Helpers.checkInternetConnection()) {
                return false;
            }
            QB.chat.dialog.list({"_id": id}, (err, res) => {
                if (err) {
                    console.error(err);
                    reject(err);
                }

                let dialog = res.items[0];

                if(dialog) {
                    resolve(dialog);
                } else {
                    reject(new Error('can\'t find dialog with this id: ' + id));
                }
            });
        });
    }

    static checkCachedUsersInDialog(dialogId) {
        let userList = this._cache[dialogId].users,
            unsetUsers = [];

        return new Promise((resolve, reject) => {
            for (var i = 0; i < userList.length; i++) {
                if (!Users._cache[userList[i]]) {
                    unsetUsers.push(userList[i]);
                }
            }
            if (unsetUsers.length) {
                Users.getUsersByIds(unsetUsers).then(function(){
                    resolve();
                }).catch((error) => {
                    reject(error);
                });
            } else {
                resolve();
            }
        });
    }

    static createDialog(params) {
        return new Promise((resolve, reject) => {
            QB.chat.dialog.create(params, (err, createdDialog) => {
                if (err) { 
                    reject(err);
                } else {
                    resolve(createdDialog);
                }
            });
        });
    }
}

export default Dialog;