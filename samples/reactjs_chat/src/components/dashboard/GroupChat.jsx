import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import _ from "underscore";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import QB from "quickblox/quickblox.min.js";

/** Importing Services */
import Dialog from "./../../services/Dialog.jsx";
import Auth from "./../../services/Auth.jsx";
import Users from "./../../services/Users.jsx";
import Helpers from "./../../services/Helpers.jsx";

/** Importing Sub Components. */
import ChatUser from "./ChatUser.jsx";

class GroupChat extends Component {

    constructor(props) {
        super(props);

        //this.addUserToDialog = this.addUserToDialog.bind(this);
        this.state = {
            users: []
        }
    }

    componentDidMount(){
        if(Auth.isLogin){
            this.dashboard = this.props.dashboard;
            console.log(this.dashboard);
            this.createDialogBtn = this.dashboard.createDialogBtn;
            this.sidebar = this.dashboard.sidebar;
            this.backToDialog = ReactDOM.findDOMNode(this.refs.backToDialog);
            this.userListContainer = ReactDOM.findDOMNode(this.refs.userListContainer);
            this.createDialogForm = ReactDOM.findDOMNode(this.refs.createDialogForm);
            this.init();
        }
    }

    init() {
        this.createDialogBtn.classList.add('active');
        this.sidebar.classList.remove('active');
        
        this.backToDialog.addEventListener('click', (e) => {
            this.sidebar.classList.add('active');
            this.createDialogBtn.classList.remove('active');
    
            if (Dialog.dialogId) {
                this.props.history.push("/dashboard/dialog/" + Dialog.dialogId);
            } else {
                this.props.history.push("/dashboard");
            }
        });
    

            console.log(this.createDialogForm.create_dialog_submit);
    this.createDialogForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!Helpers.checkInternetConnection()) {
            return false;
        }
        
        if (this.createDialogForm.create_dialog_submit.disabled) return false;
        
        this.createDialogForm.create_dialog_submit.disabled = true;
        
        let users = this.userListContainer.querySelectorAll('.selected'),
            type = users.length > 2 ? 2 : 3,
            name = this.createDialogForm.dialog_name.value,
            occupants_ids = [];

        _.each(users, (user) => {
            if (+user.id !== this.dashboard.getAppState.user.id) {
                occupants_ids.push(user.id);
            }
        });

        if (!name && type === 2) {
            let userNames = [];
            
            _.each(occupants_ids, (id) => {
                if (id === this.dashboard.getAppState.user.id) {
                    userNames.push(this.dashboard.getAppState.user.name || this.dashboard.getAppState.user.login);
                } else {
                    userNames.push(Users._cache[id].name);
                }
            });
            name = userNames.join(', ');
        }

        let params = {
            type: type,
            occupants_ids: occupants_ids.join(',')
        };
        
        if (type !== 3 && name) {
            params.name = name;
        }

        this.dashboard.createDialog(params);
    });

    this.createDialogForm.dialog_name.addEventListener('input', (e) => {
        let titleText = this.createDialogForm.dialog_name.value,
            sylmbolsCount = titleText.length;
        if(sylmbolsCount > 40) {
            this.createDialogForm.dialog_name.value = titleText.slice(0, 40);
        }
    });
    this.initGettingUsers();
    }

    initGettingUsers(){

        this.userListContainer.classList.add('loading');

        Users.getUsers(this.dashboard.props.getAppState.user.user_tags).then((userList) => {
            let tempObj = [];
            _.each(userList, (user) => {
                tempObj.push(this.buildUserItem(Users._cache[user.id]));
            });
            this.setState({users: tempObj});
            console.log(this.state.users);
            this.setUserITemsEvent();
            this.userListContainer.classList.remove('loading');
        }).catch((error) => {
            this.userListContainer.classList.remove('loading');
        });
    }

    buildUserItem(user) {
        let userItem = JSON.parse(JSON.stringify(user));
        if(userItem.id === this.dashboard.props.getAppState.user.id){
            userItem.selected = true;
        }
        return userItem;
    }

    setUserITemsEvent(){
        let elems = this.userListContainer.querySelectorAll(".user__item");
        for(let i = 0; i < elems.length; i++){
            console.log(elems[i]);
            elems[i].addEventListener('click', (evnt) => {
                let elem = elems[i];
                if (elem.classList.contains('disabled')) return;

                elem.classList.toggle('selected');

                if (this.userListContainer.querySelectorAll('.selected').length > 1) {
                    this.createDialogForm.create_dialog_submit.disabled = false;
                } else {
                    this.createDialogForm.create_dialog_submit.disabled = true;
                }

                if (this.userListContainer.querySelectorAll('.selected').length >= 3) {
                    this.createDialogForm.dialog_name.disabled = false;
                } else {
                    this.createDialogForm.dialog_name.disabled = true;
                }
            });
        }
    }

    render() {
        return (
            <div className="content j-content">
                <div className="content__title j-content__title j-create_dialog">
                    <button ref="backToDialog" className="back_to_dialog j-back_to_dialog">
                        <i className="material-icons">arrow_back</i>
                    </button>
                    <h1 className="group_chat__title">New Group Chat</h1>
                </div>
                <div className="notifications j-notifications hidden"></div>
                <div className="content__inner j-content__inner">
                    <p className="group__chat__description">Select participants:</p>
                    <div ref="userListContainer" className="group_chat__user_list j-group_chat__user_list">
                    {
                        this.state.users.map((user, index) => {
                            return(<ChatUser {...user} key={index} onclick={this.addUserToDialog} />)
                        })
                    }
                    </div>
                    <form ref="createDialogForm" action="" name="create_dialog" className="dialog_form m-dialog_form_create j-create_dialog_form">
                        <input className="dialog_name" name="dialog_name" type="text"  autoComplete="off"
                               autoCorrect="off" autoCapitalize="off" placeholder="Add conversation name" disabled />
                        <button className="btn m-create_dialog_btn j-create_dialog_btn"  type="submit" name="create_dialog_submit" disabled>create</button>
                    </form>
                </div>
           </div>
        );
    }
}
        
export default GroupChat;