import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import QB from "quickblox/quickblox.min.js";

class UserConversations extends Component {
    constructor() {
        super();
        this.state = {
            _id: 1,
            name: "Lando",
            color: "red",
            type:  1,
            attachment: true,
            last_message: "Hello Boy",
            last_message_date_sent: "today",
            unread_messages_count: "3",
        }
    }
    render() {
        let accountIcon;
        if(this.state.type === 2){
            accountIcon = <i className="material-icons">supervisor_account</i>
        } else {
            accountIcon = <i className="material-icons">account_circle</i>
        }
        return (
            <li className="dialog__item j-dialog__item" id={this.state._id} data-name={this.state.name}>
                <a className="dialog__item_link" href="#!/dialog/{this.state._id}">
                    <span className="dialog__avatar m-user__img_{this.state.color} m-type_{dialog.type === 2 ? 'group' : 'chat'}" >
                        {accountIcon}
                    </span>
                    <span className="dialog__info">
                        <span className="dialog__name">{this.state.name}</span>
                        <span className="dialog__last_message j-dialog__last_message { this.state.attachment ? 'attachment' : ''}">{ this.state.last_message}</span>
                    </span>
                    <span className="dialog_additional_info">
                        <span className="dialog__last_message_date j-dialog__last_message_date">{ this.state.last_message_date_sent }</span>
                        <span className="dialog_unread_counter j-dialog_unread_counter { !this.state.unread_messages_count ? 'hidden' : '' }">
                            { this.state.unread_messages_count ? this.state.unread_messages_count : '' }
                        </span>
                    </span>
                </a>
        </li>
        );
    }
}
        
export default UserConversations;