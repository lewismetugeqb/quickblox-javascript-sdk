import _ from "underscore";
import QB from "quickblox/quickblox.min.js";

/** Importing QBconfig */
import { CONSTANTS } from "./../QBconfig.json";

/** Importing Services */
import Users from "./Users.jsx";
import Messages from "./Messages.jsx";

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
    }

    static getSrcFromAttachmentId(id, token) {
        return QB.content.publicUrl(id) + '.json?token=' + token;
    }

    static checkIsMessageDeliveredToOccupants(message, userId) {
        let deliveredIds = message.delivered_ids,
            isDelivered = deliveredIds.some((id) => {
                return id !== userId;
            });

        return isDelivered;
    }

    static checkIsMessageReadedByOccupants(message, userId) {
        let readIds = message.read_ids,
            isReaded = readIds.some((id) => {
                return id !== userId;
            });

        return isReaded;
    };

    static getMessageStatus(message, userId){
        if(message.sender_id !== userId){
            return undefined;
        }

        let deleveredToOcuupants = this.checkIsMessageDeliveredToOccupants(message, userId),
            readedByOcuupants = this.checkIsMessageReadedByOccupants(message, userId),
            status = !deleveredToOcuupants ? 'not delivered yet' : readedByOcuupants ? 'seen' : 'delivered';

        return status;
    };

    static fillNewMessageParams(userId, msg, app) {
        let message = {
            _id: msg.id,
            attachments: [],
            created_at: +msg.extension.date_sent || Date.now(),
            date_sent: this.getTime(+msg.extension.date_sent * 1000 || Date.now()),
            delivered_ids: [userId],
            message: msg.body,
            read_ids: [userId],
            sender_id: userId,
            chat_dialog_id: msg.extension.dialog_id,
            selfReaded: userId === app.user.id,
            read: 0
        };

        if (msg.extension.attachments) {
            let attachments = msg.extension.attachments;

            for (let i = 0; i < attachments.length; i++) {
                attachments[i].src = this.getSrcFromAttachmentId(attachments[i].id, app.token);
            }

            message.attachments = attachments;
        }

        if (message.message === CONSTANTS.ATTACHMENT.BODY) {
            message.message = '';
        }

        if(msg.extension.notification_type) {
            message.notification_type = msg.extension.notification_type;
        }

        if(msg.extension.occupants_ids_added){
            message.occupants_ids_added = msg.extension.occupants_ids_added;
        }

        message.status = (userId !== app.user.id) ? this.getMessageStatus(message, app.user.id) : undefined;

        return message;
    }

    static fillMessagePrams(message, app) {
        let selfDelevered = this.checkIsMessageDeliveredToMe(message, app.user.id),
            selfReaded = this.checkIsMessageReadedByMe(message, app.user.id);

        // date_sent comes in UNIX time.
        message.date_sent = this.getTime(message.date_sent * 1000);

        if (message.attachments) {
            let attachments = message.attachments;
            for (var i = 0; i < attachments.length; i++) {
                attachments[i].src = this.getSrcFromAttachmentId(attachments[i].id, app.token);
            }
        }

        if (message.message === CONSTANTS.ATTACHMENT.BODY) {
            message.message = '';
        }

        if(!selfDelevered){
            Messages.sendDeliveredStatus(message._id, message.sender_id, message.chat_dialog_id);
        }

        message.selfReaded = selfReaded;

        message.status = this.getMessageStatus(message, app.user.id);

        return message;
    }

    static checkIsMessageDeliveredToMe(message, userId){
        let deliveredIds = message.delivered_ids,
            isDelivered = deliveredIds.some((id) => {
                return id === userId;
            });

        return isDelivered;
    }

    static checkIsMessageReadedByMe(message, userId){
        let readIds = message.read_ids,
            isReaded = readIds.some(function(id){
                return id === userId;
            });

        return isReaded;
    };

    static escapeHTML(str) {
        return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    static scrollTo(elem, position) {
        let elemHeight = elem.offsetHeight,
            elemScrollHeight = elem.scrollHeight;

        if (position === 'bottom') {
            if ((elemScrollHeight - elemHeight) > 0) {
                elem.scrollTop = elemScrollHeight;
            }
        } else if (position === 'top') {
            elem.scrollTop = 0;
        } else if (+position) {
            elem.scrollTop = +position
        }
    };

    static fillMessageBody(str) {
        let url,
            URL_REGEXP = /https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s\^\'\"\<\>\(\)]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s\^\'\"\<\>\(\)]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]\.[^\s\^\'\"\<\>\(\)]{2,}|www\.[a-zA-Z0-9]\.[^\s\^\'\"\<\>\(\)]{2,}/g;

        str = this.escapeHTML(str);

        // parser of paragraphs
        str = str.replace(/\n/g, '<br>');
        // parser of links
        str = str.replace(URL_REGEXP, function(match) {
            url = (/^[a-z]+:/i).test(match) ? match : 'https://' + match;

            return '<a href="' + this.escapeHTML(url) + '" target="_blank">' + this.escapeHTML(match) + '</a>';
        });

        return str;
    }

    static checkInternetConnection() {
        if (!navigator.onLine) {
            alert('No internet connection!');
            return false;
        }
        return true;
    }

}

export default Helpers;