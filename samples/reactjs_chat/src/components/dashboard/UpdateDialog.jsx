import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import _ from "underscore";

/** Importing QBconfig */
import { CONSTANTS } from "./../../QBconfig.json";

/** Importing Services */
import Dialog from "./../../services/Dialog.jsx";
import Auth from "./../../services/Auth.jsx";
import Users from "./../../services/Users.jsx";
import Helpers from "./../../services/Helpers.jsx";

/** Importing Sub Components. */
import ChatUser from "./ChatUser.jsx";

class UpdateDialog extends Component {

    constructor(props) {
        super(props);
        if(Auth.isLogin){
            Dialog.prevDialogId = Dialog.dialogId;
            Dialog.dialogId = this.props.match.params.dialogId;
        }
        this.state = {
            title: "",
            _id: null,
            users: [],
            newUsersCount: 0
        }
    }

    componentDidMount() {
        if(Auth.isLogin){
            this.setRefs();
            this.init();
        }
    }

    setRefs(){
        this.dashboard = this.props.dashboard;
        console.log(this.dashboard);
        this.updateUserListContainer = ReactDOM.findDOMNode(this.refs.updateUserListContainer);
        this.editTitleBtn = ReactDOM.findDOMNode(this.refs.editTitleBtn);
        this.editTitleForm = ReactDOM.findDOMNode(this.refs.editTitleForm);
        this.updateDialogForm = ReactDOM.findDOMNode(this.refs.updateDialogForm);
        this.updateChatCounter = ReactDOM.findDOMNode(this.refs.updateChatCounter);

    }

    init(){
        let dialogId = this.props.match.params.dialogId,
            currentDialog = Dialog._cache[dialogId];

        if(currentDialog){
            Dialog.dialogId = dialogId;
            Dialog.getDialogById(dialogId).then((dialog) => {
                console.log(dialog);
                let tabDataType = dialog.type === CONSTANTS.DIALOG_TYPES.PUBLICCHAT ? 'public' : 'chat',
                    tab = this.dashboard.tabList.querySelector('.j-sidebar__tab_link[data-type="' + tabDataType + '"]');
                // add to dialog template
                this.setState({title: dialog.name, _id: dialog._id});
                this.setListeners(dialogId);
                this.renderUsers(dialog.occupants_ids);
                this.dashboard.loadChatList(tab).then((res) => {
                }).catch((error) => {
                    console.error(error);
                });
            }).catch((error) => {
                console.error(error);
                this.props.history.push("/dashboard");
            });
        } else {
            this.setState({title: currentDialog.name, _id: currentDialog._id});
            this.setListeners(dialogId);
            this.renderUsers(currentDialog.users);
        }
    }

    renderUsers(dialogOccupants){
        console.log(this.dashboard.props.getAppState.user.user_tags);
        Users.getUsers(this.dashboard.props.getAppState.user.user_tags).then((usersArray) => {
            let users = usersArray.map((user) => {
                let userItem = JSON.parse(JSON.stringify(user));

                userItem.selected = dialogOccupants.indexOf(userItem.id) !== -1;
                    
                return userItem;
            });

            this.setState({users: users});
            this.setUserITemsEvent();
        }).catch(function(error){
            console.error(error);
        });
    }

    setUserITemsEvent(){
        let elems = this.updateUserListContainer.querySelectorAll(".user__item"),
            addUsersBtn = this.updateDialogForm.update_dialog_submit,
            newUsersCount = this.state.newUsersCount;

        for(let i = 0; i < elems.length; i++){
            elems[i].addEventListener("click", (e) => {
                console.log(e);
                let elem = e.currentTarget;
                if(elem.classList.contains("disabled")) return;
                if(elem.classList.contains("selected")){
                    elem.classList.remove("selected");
                    newUsersCount--;
                } else {
                    elem.classList.add("selected");
                    newUsersCount++;
                }

                this.setState({newUsersCount: newUsersCount});
                addUsersBtn.disabled = !newUsersCount;
            });
        }
    }

    setListeners(dialogId){
        let editTitleBtn = this.editTitleBtn,
            editTitleForm = this.editTitleForm,
            editTitleInput = editTitleForm.update_chat__title,
            editUsersCountForm = this.updateDialogForm,
            cancelBtn = editUsersCountForm.update_dialog_cancel;

            console.log(editTitleBtn, editTitleForm, editTitleInput, editUsersCountForm, cancelBtn);
            // change Title listener
            editTitleBtn.addEventListener("click", function(e){
                e.preventDefault();
                e.stopPropagation();


                editTitleForm.classList.toggle("active");

                if(editTitleForm.classList.contains("active")){
                    editTitleInput.removeAttribute("disabled");
                    editTitleInput.focus();
                } else {
                    editTitleInput.setAttribute("disabled", true);
                    this.updateDialogTitleRequest(dialogId, editTitleForm, editTitleInput);
                }
            });

            editTitleInput.addEventListener("input", (e) => {
                let titleText = editTitleInput.value,
                    sylmbolsCount = titleText.length;
                if(sylmbolsCount > 40) {
                    editTitleInput.value = titleText.slice(0, 40);
                }
            });

            editTitleForm.addEventListener("submit", (e) => {
                e.preventDefault();

                this.updateDialogTitleRequest(dialogId, editTitleForm, editTitleInput);
            });

            editUsersCountForm.addEventListener("submit", (e) => {
                e.preventDefault();

                let userItemsList = this.updateUserListContainer.querySelectorAll(".user__item.selected:not(.disabled)"),
                    userList = [];

                _.each(userItemsList, (userItem) => {
                    userList.push(+userItem.id);
                });

                let params = {
                    id: dialogId,
                    userList: userList
                };

                Dialog.updateDialog(params, this.dashboard, this.props.history);
            });

            cancelBtn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.props.history.push("/dashboard/dialog/" + dialogId);
            });

    }

    updateDialogTitleRequest(dialogId, editTitleForm, editTitleInput){
        let params = {
            id: dialogId,
            title: editTitleInput.value.trim()
        };

        if(Dialog._cache[dialogId].name !== params.title) {
            Dialog.updateDialog(params, this.dashboard, this.props.history);
            editTitleForm.classList.remove("active");
            editTitleInput.setAttribute("disabled", true);
        }
    }

    render() {
        return (
            <div className="content j-content">
                <div className="content__title j-content__title update_dialog__header j-update_dialog">
                   <Link to={ "/dashboard/dialog/" + this.state._id } className="back_to_dialog j-back_to_dialog">
                        <i className="material-icons">arrow_back</i>
                    </Link>
                    <form ref="editTitleForm" action="#" name="update_chat_name" className="update_chat_name_form">
                        <input type="text" name="update_chat__title" className="update_chat__title_input j-update_chat__title_input" value={ this.state.title } disabled />
                        <button ref="editTitleBtn" type="button" className="update_chat__title_button j-update_chat__title_button">
                            <i className="material-icons m-user_icon">create</i>
                        </button>
                    </form>
                </div>
                <div className="notifications j-notifications hidden"></div>
                <div className="content__inner j-content__inner">
                    <p className="update__chat__description"><span ref="updateChatCounter" className="update__chat_counter j-update__chat_counter">{ this.state.newUsersCount }</span>&nbsp;user selected:</p>
                    <div ref="updateUserListContainer" className="update_chat__user_list j-update_chat__user_list">
                    {
                        this.state.users.map((user, index) => {
                            return(<ChatUser {...user} key={index} />)
                        })
                    }
                    </div>
                    <form ref="updateDialogForm" action="" name="update_dialog" className="dialog_form m_dialog_form_update j-update_dialog_form">
                        <button type="button" className="btn m-update_dialog_btn_cancel j-update_dialog_btn_cancel" name="update_dialog_cancel">cancel</button>
                        <button className="btn m-update_dialog_btn j-update_dialog_btn"  type="submit" name="update_dialog_submit" disabled>add member</button>
                    </form>
                </div>
           </div>
        );
    }
}
        
export default UpdateDialog;