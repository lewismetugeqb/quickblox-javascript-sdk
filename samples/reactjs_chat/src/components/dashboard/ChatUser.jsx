import React, { Component } from 'react';

const ChatUser = (props) => {
    let j_lastSeen = null,
        selectedStatus = props.selected ? "disabled selected" : "";
    if(props.last_request_at){
        j_lastSeen = <p className="user__last_seen">{props.last_request_at}</p>
    }

    return (
        <div className={"user__item " + selectedStatus} id={props.id}>
            <span className={"user__avatar m-user__img_" + props.color}>
                <i className="material-icons m-user_icon">account_circle</i>
            </span>
            <div className="user__details">
                <p className="user__name">{props.name}</p>
                {j_lastSeen}
            </div>
        </div>
    );
}
export default ChatUser;