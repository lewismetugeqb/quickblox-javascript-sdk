import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import QB from "quickblox/quickblox.min.js";

/** Importing QBconfig */
import { AppConfig, CONSTANTS } from "./../../../QBconfig.json";

/** Importing Services */
import Helpers from "./../../../services/Helpers.jsx";
import Auth from "./../../../services/Auth.jsx";
import Dialog from "./../../../services/Dialog.jsx";
import Messages from "./../../../services/Messages.jsx";
import Users from "./../../../services/Users.jsx";

class Conversation extends Component {

    dialogTitle;
    attachmentPreviewContainer;
    messagesContainer;
    sendMessageForm;
    openSideBarBtn;
    editLink;
    quitLink;
    _typingTimer;
    _typingTime;

    constructor(props) {
        super(props);
        Dialog.prevDialogId = Dialog.dialogId;
        Dialog.dialogId = this.props.match.params.dialogId;
        this._typingTimer = null;
        this._typingTime = null;
        this.typingTimeout = AppConfig.typingTimeout || 3;
        this.state = {
            _id: null,
            title: null,
            //name: "Lando",
            //color: "red",
            type:  null,
            attachments: []
        }
    }

    componentDidMount() {
        if(Auth.isLogin){
            console.log(Dialog._cache[Dialog.dialogId].messages);
            this.setRefs();
            this.init();
            this.renderSelectedDialog();
            //this.getDialogMessages(this.props.match.params.dialogId);
        }
    }

    setRefs(){
        this.dialogTitle = ReactDOM.findDOMNode(this.refs.dialogTitle);
        this.attachmentPreviewContainer = ReactDOM.findDOMNode(this.refs.attachmentsPreviewContainer);
        this.messagesContainer = ReactDOM.findDOMNode(this.refs.messagesContainer);
        this.sendMessageForm = ReactDOM.findDOMNode(this.refs.sendMessageForm);
        this.editLink = ReactDOM.findDOMNode(this.refs.editLink);
        this.quitLink = ReactDOM.findDOMNode(this.refs.quitLink);
        this.openSideBarBtn = ReactDOM.findDOMNode(this.refs.openSideBarBtn);
    }

    init(){
        this.sendMessageForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitSendMessage(Dialog.dialogId);
            this.sendMessageForm.message_feald.focus();
        });

        this.sendMessageForm.attach_file.addEventListener('change', this.prepareToUpload.bind(this));
        this.sendMessageForm.message_feald.addEventListener('input', this.typingMessage.bind(this));
        this.sendMessageForm.message_feald.addEventListener('input', this.checkMessageSymbolsCount.bind(this));
        this.sendMessageForm.message_feald.addEventListener('keydown', (e) => {
            let key = e.keyCode;

            if (key === 13) {
                if (!e.ctrlKey && !e.shiftKey && !e.metaKey) {
                    e.preventDefault();
                    this.submitSendMessage(Dialog.dialogId);
                }
            }
        });
    }

    renderSelectedDialog(){
        var currentDialog = Dialog._cache[Dialog.dialogId];
        if(!currentDialog){
            console.log("Dialog not available in cache.");
        } else {
            this.renderMessages(Dialog.dialogId);
            this.props.selectCurrentDialog(Dialog.dialogId, this.sendMessageForm);
        }
    }

    renderMessages(dialogId) {
        let dialog = Dialog._cache[dialogId];

        this.props.toggleActiveDialogBtn(false);

        if (!this.refs.sendMessageForm) {
            this.setRefs();
            this.setState({title: dialog.name, _id: dialog._id, type: dialog.type});

            this.openSideBarBtn.addEventListener('click', (e) => {
                this.props.sidebar.classList.add('active');
            });

            this.init();

            this.quitLink.addEventListener('click', (e) => {
                e.preventDefault();
                if(dialog.type === CONSTANTS.DIALOG_TYPES.PUBLICCHAT) return;
                this.quitFromTheDialog(this.dataset.dialog);
            });
        } else {
            if (Dialog.prevDialogId) {
                this.sendStopTypingStatus(Dialog.prevDialogId);
            }

            this.setState({title: dialog.name});

            if(dialog.type === CONSTANTS.DIALOG_TYPES.CHAT || dialog.type === CONSTANTS.DIALOG_TYPES.GROUPCHAT) {
                if (dialog && dialog.messages.length) {
                    for (var i = 0; i < dialog.messages.length; i++) {
                        if(!dialog.messages[i].selfReaded) {
                            Messages.sendReadStatus(dialog.messages[i]._id, dialog.messages[i].sender_id, dialogId);
                            dialog.messages[i].selfReaded = true;
                            dialog.unread_messages_count = dialog.unread_messages_count - 1 < 0 ? 0 : dialog.unread_messages_count - 1;
                            let dialogIndex = this.props.getStateDialogIndexById(dialogId);
                            if(dialogIndex >= 0){
                                this.props.updateDashboardState((state) => {
                                    state.dialogs[dialogIndex] = dialog;
                                    return state;
                                });
                            }
                        }
                    }
                }
            }

            this.setState({_id: Dialog.dialogId});

            if(dialog.type === CONSTANTS.DIALOG_TYPES.GROUPCHAT){
                this.editLink.classList.remove('hidden');
            } else {
                this.editLink.classList.add('hidden');
            }

            if(dialog.type === CONSTANTS.DIALOG_TYPES.PUBLICCHAT){
                this.quitLink.classList.add('hidden');
            } else {
                this.quitLink.classList.remove('hidden');
            }

            this.sendMessageForm.attach_file.value = null;
        }

        this.setLoadMoreMessagesListener();

        this.sendMessageForm.message_feald.value = dialog.draft.message || '';

        Dialog.checkCachedUsersInDialog(dialogId).then(() => {
            if (dialog && dialog.messages.length) {
                Helpers.scrollTo(this.messagesContainer, 'bottom');
                console.log(dialog.messages.length, Messages.limit);
                if (dialog.messages.length < Messages.limit) {
                    this.getDialogMessages(Dialog.dialogId);
                }
            } else {
                this.getDialogMessages(Dialog.dialogId);
            }
        });
    }

    

    setLoadMoreMessagesListener() {
        this.messagesContainer.classList.remove('full');

        if (!this.messagesContainer.dataset.load) {
            this.messagesContainer.dataset.load = 'true';
            this.messagesContainer.addEventListener('scroll', this.loadMoreMessagesCallback);
        }
    }

    loadMoreMessagesCallback(e) {
        let elem = e.currentTarget,
            dialog = Dialog._cache[Dialog.dialogId];

        if (!dialog.full) {
            if (elem.scrollTop < 150 && !elem.classList.contains('loading')) {
                this.getDialogMessages(Dialog.dialogId);
            }
        } else {
            elem.removeEventListener('scroll', this.loadMoreMessagesCallback);
            delete this.messagesContainer.dataset.load;
        }
    }

    quitFromTheDialog(dialogId){
        let dialog = Dialog._cache[dialogId],
            app = this.props.getAppState;

        switch (dialog.type){
            case CONSTANTS.DIALOG_TYPES.PUBLICCHAT:
                alert("You can\'t remove this dialog");
                break;
            case CONSTANTS.DIALOG_TYPES.CHAT:
                QB.chat.dialog.delete([dialogId], (err) => {
                    if (err) {
                        console.error(err);
                    } else {
                        this._removedilogFromCacheAndUi(dialogId);
                        this.props.history.replace('/dashboard');
                    }
                });
                break;
            case CONSTANTS.DIALOG_TYPES.GROUPCHAT:
                // remove user from current  group dialog;
                this._notuyfyUsers(dialog, app);

                QB.chat.dialog.update(dialogId, {
                    pull_all: {
                        occupants_ids: [app.user.id]
                    }
                }, (err, res) => {
                    if (err) {
                        console.error(err);
                    } else {
                        this._removedilogFromCacheAndUi(dialogId);
                        this.props.history.replace('/dashboard');
                    }
                });
                break;
        }
    }

    _removedilogFromCacheAndUi(dialogId){
        delete Dialog._cache[dialogId];
        this.props.removeDialogFromState(dialogId);
    }

    _notuyfyUsers(dialog, app){
        let msg = {
            type: 'groupchat',
            body:  app.user.name + ' left the chat.',
            extension: {
                save_to_history: 1,
                dialog_id: dialog._id,
                notification_type: 2,
                dialog_updated_at: Date.now() / 1000,
                occupants_ids_removed: app.user.id
            }
        };

        this.props.sendMessage(dialog._id, msg);
    }

    getDialogMessages(dialogId){
        this.messagesContainer.classList.add('loading');
        Messages.getMessages(dialogId).then((msgRes) => {
            this.messagesContainer.classList.remove('loading');
            let dialog = Dialog._cache[dialogId];
            
            if (msgRes.messages.items.length < Messages.limit) {
                dialog.full = true;
            }
            if (Dialog.dialogId !== dialogId) return false;

            let dialogIndex = this.props.getStateDialogIndexById(dialogId);

            if (Dialog._cache[dialogId].type === 1) {
                this.checkUsersInPublicDialogMessages(msgRes.messages.items, msgRes.params.skip);
                this.props.updateDashboardState((state) => {
                    state.dialogs[dialogIndex] = Dialog._cache[dialogId];
                    return state;
                });
            } else {
                for (let i = 0; i < msgRes.messages.items.length; i++) {
                    let message = Helpers.fillMessagePrams(msgRes.messages.items[i], this.props.getAppState);
                    
                    this.props.renderMessage(message, false);
                }
                this.props.updateDashboardState((state) => {
                    state.dialogs[dialogIndex] = Dialog._cache[dialogId];
                    return state;
                });
                if (!msgRes.params.skip) {
                    Helpers.scrollTo(this.messagesContainer, 'bottom');
                }
            }
            console.log(this.props.getDashboardState);
        }).catch((e) => {
            console.log(e);
            this.messagesContainer.classList.remove('loading');
        });
    }

    checkUsersInPublicDialogMessages(items, skip) {
        let messages = [].concat(items),
            userList = [];

        for (var i = 0; i < messages.length; i++) {
            var id = messages[i].sender_id;

            if (userList.indexOf(id) === -1) {
                userList.push(id);
            }
        }

        if (!userList.length) return false;
        Users.getUsersByIds(userList).then(() => {
            for (var i = 0; i < messages.length; i++) {
                let message = Helpers.fillMessagePrams(messages[i], this.props.getAppState);
                this.props.renderMessage(message, false);
            }

            if (!skip) {
                Helpers.scrollTo(this.messagesContainer, 'bottom');
            }
        }).catch((error) => {
            console.error(error);
        });
    }

    checkMessageSymbolsCount() {
        let messageText = this.sendMessageForm.message_feald.value,
            sylmbolsCount = messageText.length;
        if(sylmbolsCount > 1000) {
            this.sendMessageForm.message_feald.value = messageText.slice(0, 1000);
        }
    };

    prepareToUpload(e) {
        if (!Helpers.checkInternetConnection()) {
            return false;
        }

        let files = e.currentTarget.files,
            dialogId = Dialog.dialogId;

        for (var i = 0; i < files.length; i++) {
            let file = files[i];
            this.uploadFilesAndGetIds(file, dialogId);
        }

        e.currentTarget.value = null;
    }

    uploadFilesAndGetIds(file, dialogId) {
        if (file.size >= CONSTANTS.ATTACHMENT.MAXSIZE) {
            return alert(CONSTANTS.ATTACHMENT.MAXSIZEMESSAGE);
        }

        let previewIndex = this.addImagePreview(file);

        QB.content.createAndUpload({
            public: false,
            file: file,
            name: file.name,
            type: file.type,
            size: file.size
        }, (err, response) => {
            let temp = this.state.attachments;
            temp.splice(previewIndex,1);
            this.setState(prevState => ({
                attachments: temp
            }));
            if (err) {
                console.error(err);
                alert('ERROR: ' + err.detail);
            } else {
                Dialog._cache[dialogId].draft.attachments[response.uid] = Helpers.getSrcFromAttachmentId(response.uid, this.props.getAppState.token);
                this.submitSendMessage(dialogId);
            }
        });
    }

    addImagePreview(file) {
        let data = {
                id: 'isLoading',
                src: URL.createObjectURL(file)
            };

        this.setState({ attachments: this.state.attachments.concat([data]) });

        return this.state.attachments.length - 1;
    }

    typingMessage(e) {
        var dialogId = Dialog.dialogId;

        this._typingTime = Date.now();

        if (!this._typingTimer) {
            this.sendIsTypingStatus(dialogId);

            this._typingTimer = setInterval(() => {
                if ((Date.now() - this._typingTime) / 1000 >= this.typingTimeout) {
                    this.sendStopTypingStatus(dialogId);
                }
            }, 500);
        }

        Dialog._cache[dialogId].draft.message = e.currentTarget.value
    }

    sendIsTypingStatus(dialogId) {
        console.log(dialogId);
        let dialog = Dialog._cache[dialogId];

        QB.chat.sendIsTypingStatus(dialog.jidOrUserId);
    }

    sendStopTypingStatus(dialogId) {
        let dialog = Dialog._cache[dialogId];

        QB.chat.sendIsStopTypingStatus(dialog.jidOrUserId);

        clearInterval(this._typingTimer);
        this._typingTimer = null;
        this._typingTime = null;
    }

    submitSendMessage(dialogId) {
        if (!Helpers.checkInternetConnection()) {
            return false;
        }

        let dialog = Dialog._cache[dialogId],
            attachments = dialog.draft.attachments,
            sendMessageForm = this.refs.sendMessageForm,
            msg = {
                type: dialog.type === 3 ? 'chat' : 'groupchat',
                body: sendMessageForm.message_feald ? sendMessageForm.message_feald.value.trim() : '',
                extension: {
                    save_to_history: 1,
                    dialog_id: dialogId
                },
                markable: 1
            };

        if (Object.keys(attachments).length) {
            msg.extension.attachments = [];

            for (let attach in attachments) {
                msg.extension.attachments.push({id: attach, type: CONSTANTS.ATTACHMENT.TYPE});
            }

            msg.body = CONSTANTS.ATTACHMENT.BODY;
            dialog.draft.attachments = {};
        } else if (Dialog.dialogId === dialogId && sendMessageForm) {
             this.props.replaceDialogLink(dialogId);
             sendMessageForm.message_feald.value = '';
             dialog.draft.message = null;
        }

        // Don't send empty message
        if (!msg.body) return false;

        this.props.sendMessage(dialogId, msg);
    }

    render() {
        let editLinkVisibility = this.state.type !== 2 ? "hidden" : "";
        let quitLinkVisibility = this.state.type === 1 ? "hidden" : "";
        return (
            <div className="content j-content">
                <div ref="dialogTitle" className="content__title j-content__title j-dialog">
                    <button ref="openSideBarBtn" className="open_sidebar j-open_sidebar"></button>
                    <h1 className="dialog__title j-dialog__title">{ this.state.title }</h1>
                    <div className="action_links">
                        <Link ref="editLink" to={"/dashboard/dialog/" + this.state._id + "/edit"} className={ "add_to_dialog j-add_to_dialog " + editLinkVisibility }>
                            <i className="material-icons">person_add</i>
                        </Link>
                        <Link ref="quitLink" to="#" className={ "quit_fom_dialog_link j-quit_fom_dialog_link " + quitLinkVisibility } data-dialog={ this.state._id }>
                            <i className="material-icons">delete</i>
                        </Link>
                    </div>
                </div>
                <div className="notifications j-notifications hidden"></div>
                <div className="content__inner j-content__inner">
                    <div ref="messagesContainer" className="messages j-messages"></div>
                    <form ref="sendMessageForm" name="send_message" className="send_message" autoComplete="off">
                            <textarea name="message_feald" className="message_feald" id="message_feald" autoComplete="off"
                                      autoCorrect="off" autoCapitalize="off" placeholder="Type a message" autoFocus></textarea>
                        <div className="message__actions">
                            <div ref="attachmentsPreviewContainer" className="attachments_preview j-attachments_preview"></div>
                            <label htmlFor="attach_btn" className="attach_btn">
                                <i className="material-icons">attachment</i>
                                <input type="file" id="attach_btn" name="attach_file" className="attach_input" accept="image/*"/>
                            </label>
                            <button className="send_btn">send</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}
        
export default Conversation;