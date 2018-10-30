import React, { Component } from 'react';
import { Link } from "react-router-dom";

class UserConversations extends Component {

    render(){
        let accountIcon;
        let dialogTypeText = this.props.data.type === 2 ? 'group' : 'chat';
        let setAttachmentClass = this.props.data.attachment ? 'attachment' : '';
        let setMsgCountClass = !this.props.data.unread_messages_count ? 'hidden' : '';
        if(this.props.data.type === 2){
            accountIcon = <i className="material-icons">supervisor_account</i>
        } else {
            accountIcon = <i className="material-icons">account_circle</i>
        }
        return (
            <li className="dialog__item j-dialog__item" id={ this.props.data._id } data-name={ this.props.data.name }>
                <Link className="dialog__item_link" to={ "/dialog/" + this.props.data._id }>
                    <span className={ "dialog__avatar m-user__img_" + this.props.data.color + " m-type_" + dialogTypeText } >
                        { accountIcon }
                    </span>
                    <span className="dialog__info">
                        <span className="dialog__name">{ this.props.data.name }</span>
                        <span className={ "dialog__last_message j-dialog__last_message" + setAttachmentClass }>{ this.props.data.last_message }</span>
                    </span>
                    <span className="dialog_additional_info">
                        <span className="dialog__last_message_date j-dialog__last_message_date">{ this.props.data.last_message_date_sent }</span>
                        <span className={ "dialog_unread_counter j-dialog_unread_counter" + setMsgCountClass }>
                            { this.props.data.unread_messages_count ? this.props.data.unread_messages_count : '' }
                        </span>
                    </span>
                </Link>
            </li>
        );
    }
}

        
export default UserConversations;