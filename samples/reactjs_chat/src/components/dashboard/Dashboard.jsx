import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import QB from "quickblox/quickblox.min.js";
import _ from "underscore";

/** Importing QBconfig */
import { CONSTANTS } from "./../../QBconfig.json";

/** Importing Services */
import Helpers from "./../../services/Helpers.jsx";
import Auth from "./../../services/Auth.jsx";
import Users from "./../../services/Users.jsx";
import Dialog from "./../../services/Dialog.jsx";
import Messages from "./../../services/Messages.jsx";

/** Importing assests */
import QBLogo from "./../../assets/img/qb-logo.svg";

/** Importing Sub Components. */
import Welcome from "./Welcome.jsx";
import Conversation from "./conversation/Conversation.jsx"
import UserConversations from "./user-conversations/UserConversations.jsx";
import GroupChat from "./GroupChat.jsx";

class Dashboard extends Component {
    
    logoutBtn;
    dialogsListContainer;
    constructor(props) {
        super(props);
        if(!Auth.isLogin){
            this.props.history.replace("/login");
        }
        this.replaceDialogLink = this.replaceDialogLink.bind(this);
        this.changeLastMessagePreview = this.changeLastMessagePreview.bind(this);
        this.toggleActiveDialogBtn = this.toggleActiveDialogBtn.bind(this);
        this.removeDialogFromState = this.removeDialogFromState.bind(this);
        this.updateDashboardState = this.updateDashboardState.bind(this);
        this.getStateDialogIndexById = this.getStateDialogIndexById.bind(this);
        this.selectCurrentDialog = this.selectCurrentDialog.bind(this);
        this.loadChatList = this.loadChatList.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.renderMessage = this.renderMessage.bind(this);
        this.createDialog = this.createDialog.bind(this);
        this.decreaseUnreadCounter = this.decreaseUnreadCounter(this);
        this.user = this.props.getAppState.user;
        this.tabName = "";
        this.user = {
            user_tags: "Test Group",
            name: "Lando"
        };
        this.state = {
            dialogs: [],
            dialogTitle: null,
            notification: {},
            messages: []
        }
    }

    componentDidMount() {
        if(Auth.isLogin){
            this.logoutBtn = ReactDOM.findDOMNode(this.refs.logoutButton);
            this.dialogsListContainer = ReactDOM.findDOMNode(this.refs.dialogsListContainer);
            this.sidebar = ReactDOM.findDOMNode(this.refs.sidebar);
            this.content = ReactDOM.findDOMNode(this.refs.content);
            this.tabList = ReactDOM.findDOMNode(this.refs.tabList);
            this.createDialogBtn = ReactDOM.findDOMNode(this.refs.createDialogBtn);
            Auth.isDashboardLoaded = true;
            this.init();

            // setTimeout(() => {
            //     this.setState((state) => {
            //       state.dialogs[0].unread_messages_count = 9;
            //       return state
            //     });
            // }, 10000);
            // setTimeout(() => {
            //     console.log("done");
            //     console.log(ReactDOM.findDOMNode(this.refs.createDialog));
            //     //this.refs.createDialog.props.className += " active";
            // }, 15000);
        }
    }

    init(){
        this.dialogsListContainer.addEventListener('scroll', () => {
            let container = this.dialogsListContainer,
                position = container.scrollHeight - (container.scrollTop + container.offsetHeight),
                dialogListCount = this.dialogsListContainer.querySelectorAll('.j-dialog__item').length;

            if (container.classList.contains('full')) {
                return false;
            }

            if (position <= 50 && !container.classList.contains('loading')) {
                let type = this.sidebar.querySelector('.j-sidebar__tab_link.active').dataset.type;
                Dialog.loadDialogs(type, dialogListCount).then((dialogs) => {
                    console.log(dialogs);
                }).catch((error) => {
                    console.log(error);
                });
            }
        });

        //listeners.setListeners();

        this.logoutBtn.addEventListener('click', () => {
            QB.users.delete(this.props.getAppState.user.id, (err, user) => {
                if (err) {
                    console.error('Can\'t delete user by id: '+this.props.getAppState.user.id+' ', err);
                }

                Auth.isLogin = false;
                Auth.isDashboardLoaded = false;

                localStorage.removeItem('user');
                Helpers.clearCache();

                QB.chat.disconnect();
                QB.destroySession();

                this.props.history.replace("/login");
            });
        });
        this.tabSelectInit();
    }

    selectCurrentDialog(dialogId, sendMessageForm) {
        let dialogElem = ReactDOM.findDOMNode(this.refs[dialogId]);

        this.sidebar.classList.remove('active');

        if (!Helpers.checkInternetConnection()) {
            return false;
        }

        if (dialogElem.classList.contains('selected') && sendMessageForm) return false;

        let selectedDialog = this.dialogsListContainer.querySelector('.dialog__item.selected');

        if (selectedDialog) {
            selectedDialog.classList.remove('selected');
        }

        dialogElem.classList.add('selected');
    }

    tabSelectInit() {
        let tabs = this.tabList.querySelectorAll('.j-sidebar__tab_link');
        _.each(tabs, (item) => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                if (!Helpers.checkInternetConnection()) {
                    return false;
                }

                let tab = e.currentTarget;
                this.setState({dialogs: []});
                this.loadChatList(tab).then((chatList) =>{
                    this.renderChatList(chatList);
                }).catch((e) => {
                    console.log(e);
                });
            });
        });
        /** Auto selecting the first tab. */
        tabs[0].click();
    }

    loadChatList(tab) {
        return new Promise((resolve, reject) => {
            let tabs = this.tabList.querySelectorAll('.j-sidebar__tab_link');
            let dialogListCount = this.dialogsListContainer.querySelectorAll('.j-dialog__item').length;
            if (tab.classList.contains('active')) {
                return false;
            }

            _.each(tabs, (elem) => {
                elem.classList.remove('active');
            });

            tab.classList.add('active');

            //load conversations
            // helpers.clearView(dialogModule.dialogsListContainer);
            this.dialogsListContainer.classList.remove('full');
            if (!Helpers.checkInternetConnection()) {
                reject(new Error('no internet connection'));
            }
            this.dialogsListContainer.classList.add('loading');
            Dialog.loadDialogs(tab.dataset.type, dialogListCount).then((dialogs) => {
                resolve(dialogs);
            }).catch((error) => {
                reject(error);
            });
        });
    }

    renderChatList(chatlist){
         let dialogs = chatlist.items;

        _.each(dialogs, (dialog) => {
            if (!Dialog._cache[dialog._id]) {
                Dialog._cache[dialog._id] = Helpers.compileDialogParams(dialog, this.props.getAppState);
            }
            this.renderDialog(Dialog._cache[dialog._id]);
        });
        if (this.dialogId) {
            let dialogElem = this.refs[this.dialogId];
            if (dialogElem) dialogElem.classList.add('selected');
        }

        if (dialogs.length < Dialog.limit) {
            this.dialogsListContainer.classList.add('full');
        }
        this.dialogsListContainer.classList.remove('loading');
    }

    decreaseUnreadCounter(dialogId){
        let dialog = Dialog._cache[dialogId];

        // Can't decrease unexist dialog or dialog without unread messages.
        if(dialog === undefined || dialog.unread_messages_count <= 0) return;

        dialog.unread_messages_count--;
        let dialogIndex = this.getStateDialogIndexById(dialogId);
        if(dialogIndex >= 0){
            this.setState((state) => {
                state.dialogs[dialogIndex].unread_messages_count = dialog.unread_messages_count;
                return state;
            });
        }
    }

    renderDialog(dialog, setAsFirst) {
        let id = dialog._id,
            dialogIndex = this.getStateDialogIndexById(id);

        if(!Dialog._cache[id]){
            Dialog._cache[id] = Helpers.compileDialogParams(dialog, this.props.getAppState);
            dialog = Dialog._cache[id];
        }

        if (dialogIndex >= 0) {
            this.replaceDialogLink(id);
            //return elem;
        }

        /** Join a dialog if it a group dialog. */
        if (dialog.type !== CONSTANTS.DIALOG_TYPES.CHAT && !dialog.joined) {
            this.joinToDialog(id);
        }

        if (!setAsFirst) {
            this.setState({ dialogs: this.state.dialogs.concat([dialog]) });
        } else {
            let temp = this.state.dialogs;
            temp.splice(0,0,dialog);
            this.setState(prevState => ({
                dialogs: temp
            }));
        }
    }


    replaceDialogLink(id) {
        let dialogIndex = this.getStateDialogIndexById(id);
        if (dialogIndex >= 5) {
            let temp = this.state.dialogs;
            temp.splice(0, 1, Dialog._cache[id]);
            this.setState(prevState => ({
                dialogs: temp
            }));
        }
    }

    joinToDialog(id) {
        let jidOrUserId = Dialog._cache[id].jidOrUserId;
        Dialog.joinToDialog(jidOrUserId).then((res) => {
            Dialog._cache[id].joined = res.joined;
        }).catch((e) => {
            console.log(e);
            Dialog._cache[id].joined = false;
        });
    };

    changeLastMessagePreview(dialogId, msg) {
        let dialog = this.refs[dialogId],
            message = msg.message,
            dialogIndex = this.getStateDialogIndexById(dialogId);

        if (message.indexOf('\n') !== -1) {
            message = message.slice(0, message.indexOf('\n'));
        }

        Dialog._cache[dialogId].last_message = message;
        Dialog._cache[dialogId].last_message_date_sent = msg.date_sent;

        if (dialog && dialogIndex >= 0) {
            let messagePreview = dialog.querySelector('.j-dialog__last_message ');

            if (msg.message) {
                messagePreview.classList.remove('attachment');
                this.setState((state) => {
                    state.dialogs[dialogIndex].last_message = message;
                    return state;
                });
            } else {
                messagePreview.classList.add('attachment');
                this.setState((state) => {
                    state.dialogs[dialogIndex].last_message = "Attachment";
                    return state;
                });
            }

            this.setState((state) => {
                state.dialogs[dialogIndex].last_message_date_sent = msg.date_sent;
                return state;
            });
        }
    }

    sendMessage(dialogId, msg){
        let newMessage = Messages.sendMessage(dialogId, msg);

        if (Dialog.dialogId === dialogId) {
            this.renderMessage(newMessage, true);
        }

        this.changeLastMessagePreview(dialogId, newMessage);
    }

    createDialog(params) {
        if (!Helpers.checkInternetConnection()) {
            return false;
        }

        Dialog.createDialog(params).then((createdDialog) => {
            let occupants_names = [],
                id = createdDialog._id,
                occupants = createdDialog.occupants_ids,
                message_body = (this.props.getAppState.user.name || this.props.getAppState.user.login) + ' created new dialog with: ';

                _.each(occupants, function (occupantId) {
                    let occupant_name = Users._cache[occupantId].name || Users._cache[occupantId].login;

                    occupants_names.push(occupant_name);
                });

                message_body += occupants_names.join(', ');

                let systemMessage = {
                    extension: {
                        notification_type: 1,
                        dialog_id: createdDialog._id
                    }
                };

                let notificationMessage = {
                    type: 'groupchat',
                    body: message_body,
                    extension: {
                        save_to_history: 1,
                        dialog_id: createdDialog._id,
                        notification_type: 1,
                        occupants_ids: occupants.toString()
                    }
                };

                let newOccupantsIds = occupants.filter((item) => {
                    return item != this.props.getAppState.user.id
                });

                for (var i = 0; i < newOccupantsIds.length; i++) {
                    QB.chat.sendSystemMessage(newOccupantsIds[i], systemMessage);
                }

                /* Check dialog in cache */
                if (!Dialog._cache[id]) {
                    Dialog._cache[id] = Helpers.compileDialogParams(createdDialog, this.props.getAppState);
                }

                this.joinToDialog(id).then(() => {
                    if(createdDialog.type === CONSTANTS.DIALOG_TYPES.GROUPCHAT){
                        this.sendMessage(id, notificationMessage);
                    }
                });

                /* Check active tab [chat / public] */
                let type = params.type === CONSTANTS.DIALOG_TYPES.PUBLICCHAT ? 'public' : 'chat',
                    activeTab = this.tabList.querySelector('.j-sidebar__tab_link.active');

                if (activeTab && type !== activeTab.dataset.type) {
                    let tab = this.tabList.querySelector('.j-sidebar__tab_link[data-type="chat"]');
                    this.loadChatList(tab).then((res) => {
                        this.renderDialog(Dialog._cache[id], true);
                    }).catch((error) => {
                        console.error(error);
                    });
                } else {
                    this.renderDialog(Dialog._cache[id], true);
                    this.props.history.push("/dialog/" + id);
                }
        }).catch((e) => {
            console.log(e);
        });
    };

    getStateDialogIndexById(id){
        for(let i = 0; i < this.state.dialogs.length; i++){
            if(this.state.dialogs[i]._id === id) return i;
        }
        return -1;
    }

    updateDialogUi(dialogId, name){
        let cachedDialog = Dialog._cache[dialogId],
            dialogElem = this.refs[dialogId],
            dialogIndex = this.getStateDialogIndexById(dialogId);

        cachedDialog.name = name;
        this.setState((state) => {
            state.dialogs[dialogIndex].name = name;
            return state;
        });

        if(Dialog.dialogId === dialogId){
            this.setState({dialogTitle: name});
        }
    }

    updateDashboardState(newState){
        this.setState(newState);
    }

    toggleActiveDialogBtn(state){
        if(state){
            ReactDOM.findDOMNode(this.refs.createDialogBtn).classList.add('active');
        }else{
            ReactDOM.findDOMNode(this.refs.createDialogBtn).classList.remove('active');
        }
    }

    removeDialogFromState(dialogId){
        let dialogIndex = this.getStateDialogIndexById(dialogId);
        if(dialogIndex >= 0){
            let temp = this.state.dialogs;
            temp.splice(dialogIndex, 1);
            this.setState(prevState => ({
                dialogs: temp
            }));
        }
    }


    renderMessage(message, setAsFirst) {
        var sender = Users._cache[message.sender_id],
            dialogId = message.chat_dialog_id,
            dialog = Dialog._cache[dialogId],
            messageText;

        if(!message.selfReaded){
            Messages.sendReadStatus(message._id, message.sender_id, dialogId);
            message.selfReaded = true;
            dialog.unread_messages_count = dialog.unread_messages_count - 1 < 0 ? 0 : dialog.unread_messages_count - 1;
            //this.props.decreaseUnreadCounter(dialogId);
        }

        if(message.notification_type || (message.extension && message.extension.notification_type)) {
            messageText = message.message ? Helpers.escapeHTML(message.message) : Helpers.escapeHTML(message.body);

            message.notificationData = {
                id: message._id,
                text: messageText
            };
        } else {
            messageText = message.message ? Helpers.fillMessageBody(message.message || '') : Helpers.fillMessageBody(message.body || '');
            message.messageData = {
                id: message._id,
                text: messageText
            };
        }

        let elem = ReactDOM.findDOMNode(this.refs[message._id]);
        message.sender = sender;

        if (message.attachments.length) {
            console.log("Load the attachments...");
            // let images = elem.querySelectorAll('.message_attachment');

            // for (let i = 0; i < images.length; i++) {
            //     images[i].addEventListener('load', (e) => {
            //         let img = e.target,
            //             imgPos = this.messagesContainer.offsetHeight + this.messagesContainer.scrollTop - img.offsetTop,
            //             scrollHeight = this.messagesContainer.scrollTop + img.offsetHeight;

            //         img.classList.add('loaded');

            //         if (imgPos >= 0) {
            //             this.messagesContainer.scrollTop = scrollHeight + 5;
            //         }
            //     });
            //     images[i].addEventListener('error', (e) => {
            //         console.log("Could not load img");
            //         let img = e.target,
            //             errorMessageTpl = helpers.fillTemplate('tpl_attachmentLoadError'),
            //             errorElem = helpers.toHtml(errorMessageTpl)[0];

            //         img.parentElement.replaceChild(errorElem, img);
            //     });
            // }
        }

         if (setAsFirst) {
            console.log("Splicing message");
            dialog.messages.splice(0, 0, message);
            //this.setState({ dialogs: this.state.dialogs.concat([dialog]) });
        //     let scrollPosition = this.messagesContainer.scrollHeight - (this.messagesContainer.offsetHeight + this.messagesContainer.scrollTop),
        //         typingElem = ReactDOM.findDOMNode(this.refs.typingContainer).querySelector('.j-istyping');

        //     if (typingElem) {
        //         this.messagesContainer.insertBefore(elem, typingElem);
        //     } else {
        //         this.messagesContainer.appendChild(elem);
        //     }

        //     if (scrollPosition < 50) {
        //         helpers.scrollTo(self.container, 'bottom');
        //     }
         } else {
            dialog.messages.push(message);
        //     var containerHeightBeforeAppend = self.container.scrollHeight - self.container.scrollTop;

        //     self.container.insertBefore(elem, self.container.firstElementChild);

        //     var containerHeightAfterAppend = self.container.scrollHeight - self.container.scrollTop;

        //     if (containerHeightBeforeAppend !== containerHeightAfterAppend) {
        //         self.container.scrollTop += containerHeightAfterAppend - containerHeightBeforeAppend;
        //     }
        }
    }

    /** Listeners */

    onMessageListener(userId, message) {
        if(userId === this.props.getAppState.user.id) return false;

        let msg = Helpers.fillNewMessageParams(userId, message, this.props.getAppState),
            dialog = Dialog._cache[message.dialog_id];

        if(message.markable){
            Messages.sendDeliveredStatus(msg._id, userId, msg.chat_dialog_id);
        }

        if (dialog) {
            dialog.messages.unshift(msg);
            this.changeLastMessagePreview(msg.chat_dialog_id, msg);

            if(message.extension.notification_type){
                return this.onNotificationMessage(userId, message);
            }

            let activeTab = this.tabList.querySelector('.j-sidebar__tab_link.active'),
                tabType = activeTab.dataset.type,
                dialogType = dialog.type === 1 ? 'public' : 'chat',
                dialogIndex = this.getStateDialogIndexById(dialog._id);

            if(tabType === dialogType){
                this.renderDialog(dialog, true);

                if (Dialog.dialogId === msg.chat_dialog_id) {
                    //this.renderMessage(msg, true);
                    console.log("time to render message in conversation component");
                } else {
                    dialog.unread_messages_count += 1;
                    if(dialogIndex >= 0){
                        this.setState((state) => {
                            state.dialogs[dialogIndex].unread_messages_count = dialog.unread_messages_count;
                            return state;
                        });
                    }
                }
            }
        } else {
            Dialog.getDialogById(msg.chat_dialog_id).then(function(dialog){
                Dialog._cache[dialog._id] = Helpers.compileDialogParams(dialog, this.props.getAppState);

                let type = dialog.type === 1 ? 'public' : 'chat',
                    activeTab = this.tabList.querySelector('.j-sidebar__tab_link.active'),
                    cachedDialog = Dialog._cache[dialog._id];
                if (activeTab && type === activeTab.dataset.type) {
                    this.renderDialog(cachedDialog, true);
                }
            }).catch(function(e){
                console.error(e);
            });
        }
    };

    onNotificationMessage(userId, message){
        let msg = Helpers.fillNewMessageParams(userId, message, this.props.getAppState),
            dialog = Dialog._cache[message.dialog_id],
            
            extension = message.extension,
            dialogId = message.dialog_id,
            occupantsIdsAdded = extension.occupants_ids_added && extension.occupants_ids_added.split(',');

        if(extension.notification_type === CONSTANTS.NOTIFICATION_TYPES.UPDATE_DIALOG){
            if (extension.occupants_ids_removed) {
                Dialog._cache[dialogId].users = Dialog._cache[dialogId].users.filter((user) => {
                    return user !== userId;
                });
            } else if(extension.occupants_ids_added) {
                _.each(occupantsIdsAdded, (userId) => {
                    if (dialog.users.indexOf(+userId) === -1) {
                        dialog.users.push(+userId);
                    }
                });
            } else if(extension.dialog_name){
                dialog.name = extension.dialog_name;
                this.updateDialogUi(dialogId, extension.dialog_name);
            }
        }

        let activeTab = this.tabList.querySelector('.j-sidebar__tab_link.active'),
            tabType = activeTab.dataset.type,
            dialogType = dialog.type === 1 ? 'public' : 'chat',
            dialogIndex = this.getStateDialogIndexById(message.dialog_id);

        if(tabType === dialogType){
            this.renderDialog(dialog, true);

            if (Dialog.dialogId === msg.chat_dialog_id) {
                //this.renderMessage(msg, true);
                console.log("time to render message in conversation component");
            } else {
                dialog.unread_messages_count += 1;
                if(dialogIndex >= 0){
                    this.setState((state) => {
                        state.dialogs[dialogIndex].unread_messages_count = dialog.unread_messages_count;
                        return state;
                    });
                }
            }
        }
    }

    /** End of Listeners */

    render() {
        return (
            <div className="dashboard">
                <div ref="sidebar" className="sidebar j-sidebar active">
                    <div className="sidebar__inner">
                        <div className="sidebar__header">
                            <a href="https://quickblox.com/" className="dashboard__logo">
                                <img src={ QBLogo } alt="QuickBlox" />
                            </a>
                            <div className="dashboard__status_wrap">
                                <h2 className="dashboard__title">{ this.user.user_tags }</h2>
                                <p className="dashboard__status j-dashboard_status">Logged in as { this.user.name }</p>
                            </div>
                            <a ref="logoutButton" href="#" className="logout j-logout">logout</a>
                        </div>
                        <div className="sidebar__content">
                            <ul ref="tabList" className="sidebar__tabs">
                                <li className="sidebar__tab">
                                    <a ref="tabLink1" href="#" className="sidebar__tab_link j-sidebar__tab_link"  data-type="chat">chats</a>
                                </li>
                                <li className="sidebar__tab">
                                    <a ref="tabLink2" href="#" className="sidebar__tab_link j-sidebar__tab_link" data-type="public">public chats</a>
                                </li>
                                <li className="sidebar__tab m-sidebar__tab_new">
                                    <Link ref="createDialogBtn" to="/dashboard/create/dialog" className="sidebar__tab_link j-sidebar__create_dialog m-sidebar__tab_link_new" data-type="create">
                                        <i className="material-icons">add_circle_outline</i>
                                    </Link>
                                </li>
                            </ul>
                            <ul ref="dialogsListContainer" className="sidebar__dilog_list j-sidebar__dilog_list">
                                {
                                   this.state.dialogs.map((dialog, index) => {
                                       return(<UserConversations ref={dialog._id} key={index} data={dialog} />)
                                   })
                                }
                            </ul>
                        </div>
                    </div>
                </div>
                <div ref="content" className="content j-content">
                    <Route exact path="/dashboard" component={Welcome} />
                    <Route exact path="/dashboard/create/dialog" 
                        render={(props) => <GroupChat
                            {...props}
                            dashboard={this}
                        />} 
                    />
                    <Route path="/dashboard/dialog/:dialogId" 
                        render={(props) => <Conversation
                            {...props}
                            key={props.match.params.dialogId}
                            getAppState={this.props.getAppState}
                            getDashboardState={this.state}
                            updateAppState={this.props.updateAppState}
                            updateDashboardState={this.updateDashboardState}
                            replaceDialogLink={this.replaceDialogLink}
                            changeLastMessagePreview={this.changeLastMessagePreview}
                            toggleActiveDialogBtn={this.toggleActiveDialogBtn}
                            sidebar={this.sidebar}
                            sendMessage={this.sendMessage}
                            renderMessage={this.renderMessage}
                            removeDialogFromState={this.removeDialogFromState}
                            getStateDialogIndexById={this.getStateDialogIndexById}
                            selectCurrentDialog={this.selectCurrentDialog}
                            loadChatList={this.loadChatList}
                            decreaseUnreadCounter={this.decreaseUnreadCounter}
                        />} 
                    />
                </div>
            </div>
        );
    }
}
        
export default Dashboard;