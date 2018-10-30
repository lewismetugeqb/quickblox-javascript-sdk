import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import QB from "quickblox/quickblox.min.js";
import _ from "underscore";

/** Importing QBconfig */
import { CONSTANTS } from "./../../QBconfig.json";

/** Importing Services */
import Helpers from "./../../services/Helpers.jsx";
import Auth from "./../../services/Auth.jsx";
import Dialog from "./../../services/Dialog.jsx";

/** Importing assests */
import QBLogo from "./../../assets/img/qb-logo.svg";

/** Importing Sub Components. */
import Welcome from "./Welcome.jsx";
import Conversation from "./conversation/Conversation.jsx"
import UserConversations from "./user-conversations/UserConversations.jsx";

class Dashboard extends Component {
    
    logoutBtn;
    dialogsListContainer;
    constructor(props) {
        super(props);
        if(!Auth.isLogin){
            this.props.history.replace("/login");
        }
        this._cache = {};
        this.app = this.props.getAppState();
        this.user = this.app.user;
        this.tabName = "";
        this.user = {
            user_tags: "Test Group",
            name: "Lando"
        };
        this.state = {
            dialogs: []
        }
    }

    componentDidMount() {
        if(Auth.isLogin){
            this.logoutBtn = this.refs.logoutButton;
            this.dialogsListContainer = this.refs.dialogsListContainer;
            this.sideBar = this.refs.sideBar;
            this.content = this.refs.content;
            Auth.isDashboardLoaded = true;
            this.init();

            // setTimeout(() => {
            //     this.setState((state) => {
            //       state.dialogs[0].unread_messages_count = 9;
            //       return state
            //     });
            // }, 10000);

            // setTimeout(() => {
            //     this.setState((state) => {
            //       state.dialogs[0].unread_messages_count = 0;
            //       return state
            //     });
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
                let type = this.sideBar.querySelector('.j-sidebar__tab_link.active').dataset.type;
                Dialog.loadDialogs(type, dialogListCount).then((dialogs) => {
                    console.log(dialogs);
                }).catch((error) => {
                    console.log(error);
                });
            }
        });

        //listeners.setListeners();

        this.logoutBtn.addEventListener('click', () => {
            QB.users.delete(this.app.user.id, (err, user) => {
                if (err) {
                    console.error('Can\'t delete user by id: '+this.app.user.id+' ', err);
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

    tabSelectInit() {
        let tabs = this.refs.tabList.querySelectorAll('.j-sidebar__tab_link');
        _.each(tabs, (item) => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                if (!this.checkInternetConnection()) {
                    return false;
                }

                let tab = e.currentTarget;
                this.setState({dialogs: []});
                this.loadChatList(tab).then((chatList) =>{
                    console.log(chatList);
                    this.renderChatList(chatList);
                }).catch((e) => {
                    console.log(e);
                });
            });
        });
        /** Auto selecting the first tab. */
        tabs[0].click();
    };

    loadChatList(tab) {
        return new Promise((resolve, reject) => {
            let tabs = this.refs.tabList.querySelectorAll('.j-sidebar__tab_link');
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
            if (!this.checkInternetConnection()) {
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
            if (!this._cache[dialog._id]) {
                this._cache[dialog._id] = Helpers.compileDialogParams(dialog, this.props.getAppState());
            }
            this.renderDialog(this._cache[dialog._id]);
        });
        console.log(this.state.dialogs);
        if (this.dialogId) {
            let dialogElem = this.refs[this.dialogId];
            if (dialogElem) dialogElem.classList.add('selected');
        }

        if (dialogs.length < Dialog.limit) {
            this.dialogsListContainer.classList.add('full');
        }
        this.dialogsListContainer.classList.remove('loading');
    }

    renderDialog(dialog, setAsFirst) {
        let id = dialog._id,
            elem = this.refs[id];

        if(!this._cache[id]){
            this._cache[id] = Helpers.compileDialogParams(dialog, this.props.getAppState());
            dialog = this._cache[id];
        }

        if (elem) {
            this.replaceDialogLink(elem);
            return elem;
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

    replaceDialogLink(elem) {
        let elemsCollection = this.dialogsListContainer.children,
            elemPosition;

        for (var i = 0; i < elemsCollection.length; i++) {
            if (elemsCollection[i] === elem) {
                elemPosition = i;
                break;
            }
        }

        if (elemPosition >= 5) {
            this.dialogsListContainer.replaceChild(elem, this.dialogsListContainer.firstElementChild);
        }
    }

    joinToDialog(id) {
        let jidOrUserId = this._cache[id].jidOrUserId;
        Dialog.joinToDialog(jidOrUserId).then((res) => {
            this._cache[id].joined = res.joined;
        }).catch((e) => {
            console.log(e);
            this._cache[id].joined = false;
        });
    };

    checkInternetConnection() {
        if (!navigator.onLine) {
            alert('No internet connection!');
            return false;
        }
        return true;
    }

    render() {
        return (
            <div className="dashboard">
                <div ref="sideBar" className="sidebar j-sidebar active">
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
                                    <Link to="/dialog/create" className="sidebar__tab_link j-sidebar__create_dialog m-sidebar__tab_link_new" data-type="create">
                                        <i className="material-icons">add_circle_outline</i>
                                    </Link>
                                </li>
                            </ul>
                            <ul ref="dialogsListContainer" className="sidebar__dilog_list j-sidebar__dilog_list">
                                {
                                   this.state.dialogs.map((dialog, index) => {
                                       return(<UserConversations key={index} data={dialog} msgCount={dialog.unread_messages_count} ref={dialog._id} />)
                                   })
                                }
                            </ul>
                        </div>
                    </div>
                </div>
                <div ref="content" className="content j-content">
                    <Route exact path="/dashboard" component={Welcome} />
                    <Route path="/dashboard/dialog" component={Conversation} />
                </div>
            </div>
        );
    }
}
        
export default Dashboard;