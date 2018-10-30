import _ from "underscore";

/** Importing QBconfig */
import { CONSTANTS } from "./../QBconfig.json";

/** Importing Services */
import Users from "./Users.jsx";

class Helpers {
    static getUui(){
        let navigatorInfo = window.navigator;
        let screenInfo = window.screen;
        var uid = 'chat' + navigatorInfo.mimeTypes.length;

        uid += navigatorInfo.userAgent.replace(/\D+/g, '');
        uid += navigatorInfo.plugins.length;
        uid += screenInfo.height || '';
        uid += screenInfo.width || '';
        uid += screenInfo.pixelDepth || '';

        return uid;
    }

    static clearCache(messageModule, dialogModule, userModule, updateAppState) {
        if (messageModule._typingTime) {
            messageModule.sendStopTypingStatus(dialogModule.dialogId);
        }

        messageModule._cache = {};
        messageModule.typingUsers = {};

        dialogModule._cache = {};
        dialogModule.dialogId = null;
        dialogModule.prevDialogId = null;

        userModule._cache = {};
        updateAppState({user: null});
    }

    static compileDialogParams(dialog, app) {
        if(dialog.type === CONSTANTS.DIALOG_TYPES.CHAT){
            let user = {
                full_name: dialog.name,
                id: dialog.occupants_ids.filter((id) => {
                    if (id !== app.user.id) return id;
                })[0],
                color: dialog.color || _.random(1, 10)
            };

            Users.addToCache(user);
        }

        return {
            _id: dialog._id,
            name: dialog.name,
            type: dialog.type,
            color: dialog.color || this.getDialogColor(dialog, app) || _.random(1, 10),
            last_message: dialog.last_message === CONSTANTS.ATTACHMENT.BODY ? 'Attachment' : dialog.last_message,
            messages: [],
            attachment: dialog.last_message === CONSTANTS.ATTACHMENT.BODY,
            // last_message_date_sent comes in UNIX time.
            last_message_date_sent: this.getTime(dialog.last_message_date_sent ? dialog.last_message_date_sent * 1000 : dialog.updated_at),
            users: dialog.occupants_ids || [],
            jidOrUserId: dialog.xmpp_room_jid || dialog.jidOrUserId || this.getRecipientUserId(dialog.occupants_ids, app),
            unread_messages_count: dialog.unread_messages_count,
            full: false,
            draft: {
                message: '',
                attachments: {}
            },
            joined: false
        };
    }

    static getDialogColor(dialog, app){
        if(dialog.type === 3){
            let occupants = dialog.occupants_ids;
            for(var i = 0; i < occupants.length; i++){
                if(occupants[i] !== app.user.id){
                    return Users._cache[occupants[i]].color;
                }
            }
        }
    }

    static getRecipientUserId(users, app) {
        if (users.length === 2) {
            return users.filter((user) => {
                if (user !== app.user.id) {
                    return user;
                }
            })[0];
        }
    }

    static getTime(time) {
        let date = new Date(time),
            hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours(),
            minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();

        return hours + ':' + minutes;
    };
}

export default Helpers;