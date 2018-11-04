import _ from "underscore";
import QB from "quickblox/quickblox.min.js";

/** Importing QBconfig */
import { AppConfig, CONSTANTS } from "./../QBconfig.json";

/** Importing Services */
import Dialog from "./Dialog.jsx";
import Users from "./Users.jsx";
import Helpers from "./Helpers.jsx";

class Messages {


    static limit = AppConfig.messagesPerRequest || 50;

    static sendDeliveredStatus(messageId, userId, dialogId){
        let params = {
            messageId: messageId,
            userId: userId,
            dialogId: dialogId
        };
        QB.chat.sendDeliveredStatus(params);
    }

    static sendReadStatus(messageId, userId, dialogId){
        var params = {
            messageId: messageId,
            userId: userId,
            dialogId: dialogId
        };
        QB.chat.sendReadStatus(params);
    }

    static sendMessage(dialogId, msg){
        let message = JSON.parse(JSON.stringify(msg)),
            dialog = Dialog._cache[dialogId],
            jidOrUserId = dialog.jidOrUserId;

        message.id = QB.chat.send(jidOrUserId, msg);
        message.extension.dialog_id = dialogId;

        let newMessage = Helpers.fillNewMessageParams(this.props.getAppState.user.id, message, this.props.getAppState);

        Dialog._cache[dialogId].messages.unshift(newMessage);

        return newMessage;
    }

   static getMessages(dialogId) {
       return new Promise((resolve, reject) => {
           if(!navigator.onLine) reject(false);

            let params = {
                    chat_dialog_id: dialogId,
                    sort_desc: 'date_sent',
                    limit: this.limit,
                    skip: Dialog._cache[dialogId].messages.length,
                    mark_as_read: 0
                };

            QB.chat.message.list(params, async (err, messages) => {
                if (messages) {
                    let unCachedUsers = [];
                    for(let i = 0; i < messages.items.length; i++){
                        let sender = Users._cache[messages.items[i].sender_id];
                        if(!sender){
                            unCachedUsers.push(messages.items[i].sender_id);
                        }
                    }
                    if(unCachedUsers.length > 0){
                        let usersResponse = await Users.getUsersByIds(unCachedUsers);
                        if(usersResponse === true){
                            resolve({messages: messages, params: params});
                        }else{
                            reject(usersResponse);
                        }
                    }else{
                        resolve({messages: messages, params: params});
                    }
                } else {
                    reject(err);
                }
            });
       });
    };
}

export default Messages;