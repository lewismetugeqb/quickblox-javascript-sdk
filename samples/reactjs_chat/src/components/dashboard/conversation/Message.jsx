import React, { Component } from 'react';
import _ from "underscore";

/** Importing Sub Components. */
import Notification from "./Notification.jsx";

const Message = (props) => {
    let msgName = props.sender ? props.sender.name : 'unknown user (' + props.sender_id + ')';
    let j_msg = props.message ? <p className="message__text">{ props.message }</p> : "";
    let avatarColor = props.sender ? props.sender.color : "not_loaded";
    let j_attachmentsDiv;
    if(props.attachments.length){ 
        j_attachmentsDiv = <div className="message__attachments_wtap">{ 
            props.attachments.map((attachment, index) => {
                return(<img src={ attachment.src } alt="attachment" className="message_attachment" />)
            })
        }</div>
    }
    if(props.notificationData){
        return (<Notification {...props.notificationData} />);
    }else{
        return (
            <div className="message__wrap" id={ props._id } data-status={ props.status }>
                <span className={ "message__avatar m-user__img_" + avatarColor }>
                    <i className="material-icons">account_circle</i>
                </span>
                <div className="message__content">
                    <div className="message__sender_and_status">
                        <p className="message__sender_name">{ msgName }</p>
                        <p className="message__status j-message__status">{ props.status }</p>
                    </div>
                    <div className="message__text_and_date">
                        <div className="message__text_wrap">
                            { j_msg }
                            { j_attachmentsDiv }
                        </div>
                        <div className="message__timestamp">
                            { props.date_sent }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
export default Message;