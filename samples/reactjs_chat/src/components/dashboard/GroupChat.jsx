import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import QB from "quickblox/quickblox.min.js";

/** Importing assests */
import QBLogo from "./../../assets/img/qb-logo.svg";
import QBLogoGrey from "./../../assets/img/qblogo-grey.svg";

class GroupChat extends Component {
    constructor() {
        super();
        this.state = {
        }
    }
    render() {
        return (
            <div className="content j-content">
                <div class="content__title j-content__title j-create_dialog">
                    <button class="back_to_dialog j-back_to_dialog">
                        <i class="material-icons">arrow_back</i>
                    </button>
                    <h1 class="group_chat__title">New Group Chat</h1>
                </div>
                <div class="notifications j-notifications hidden"></div>
                <div class="content__inner j-content__inner">
                    <p class="group__chat__description">Select participants:</p>
                    <div class="group_chat__user_list j-group_chat__user_list">
                    </div>
                    <form action="" name="create_dialog" class="dialog_form m-dialog_form_create j-create_dialog_form">
                        <input class="dialog_name" name="dialog_name" type="text"  autocomplete="off"
                               autocorrect="off" autocapitalize="off" placeholder="Add conversation name" disabled />
                        <button class="btn m-create_dialog_btn j-create_dialog_btn"  type="submit" name="create_dialog_submit" disabled>create</button>
                    </form>
                </div>
           </div>
        );
    }
}
        
export default GroupChat;