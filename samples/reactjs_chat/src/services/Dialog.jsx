import QB from "quickblox/quickblox.min.js";

/** Importing QBconfig */
import { AppConfig, CONSTANTS } from "./../QBconfig.json";

class Dialog {

    static limit = AppConfig.dilogsPerRequers || 30;

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
    
}

export default Dialog;