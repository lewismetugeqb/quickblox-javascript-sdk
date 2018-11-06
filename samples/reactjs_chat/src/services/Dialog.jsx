import QB from "quickblox/quickblox.min.js";
import _ from "underscore";

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

    static updateDialog(updates, dashboard, history) {
        let app = dashboard.props.getAppState,
            dialogId = updates.id,
            dialog = this._cache[dialogId],
            toUpdateParams = {},
            newUsers,
            updatedMsg = {
                type: 'groupchat',
                body: '',
                extension: {
                    save_to_history: 1,
                    dialog_id: dialog._id,
                    notification_type: 2,
                    dialog_updated_at: Date.now() / 1000
                }
            };

        if(dialog.type !== CONSTANTS.DIALOG_TYPES.GROUPCHAT) return false;

        if(updates.title){
            if(updates.title !== dialog.name){
                toUpdateParams.name = updates.title;
                updatedMsg.extension.dialog_name = updates.title;
                updatedMsg.body = app.user.name + ' changed the conversation name to "' + updates.title + '".';
            }
        }

        if (updates.userList) {
            newUsers =  this.getNewUsers(updates, dialog);

            if(newUsers.length){
                toUpdateParams.push_all = {
                    occupants_ids: newUsers
                };

                let usernames = newUsers.map((userId) => {
                    return Users._cache[userId].name || userId;
                });

                this._cache[dialogId].users = this._cache[dialogId].users.concat(newUsers);

                updatedMsg.body = app.user.name + ' adds ' + usernames.join(', ') + ' to the conversation.';
                updatedMsg.extension.occupants_ids_added = newUsers.join(',');
            } else {
                history.push("/dashboard/dialog" + dialogId);
                return false;
            }
        }

        this.sendUpdateStanza(dialogId, toUpdateParams).then((dialog) => {
            if(newUsers){
                this.notifyNewUsers(newUsers, dialog);
            }

            dashboard.sendMessage(dialogId, updatedMsg);

            if(updates.title){
                dashboard.updateDialogUi(dialogId, updates.title);
            }

            history.push("/dashboard/dialog" + dialogId);
        }).catch((error) => {
            console.error(error);
        });
    }

    static notifyNewUsers(users, dialog) {
        let msg = {
            extension: {
                notification_type: 2,
                dialog_id: dialog._id
            }
        };

        _.each(users, (user) => {
            QB.chat.sendSystemMessage(+user, msg);
        });
    }

    static sendUpdateStanza(dialogId, toUpdateParams){
        return new Promise (function(resolve, reject){
            QB.chat.dialog.update(dialogId, toUpdateParams, (err, dialog) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(dialog);
                }
            });
        });
    }

    static getNewUsers(updates, dialog){
        return updates.userList.filter((occupantId) => {
            return dialog.users.indexOf(occupantId) === -1;
        });
    }
}

export default Dialog;