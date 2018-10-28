import React, { Component } from 'react';

const ChatUser = (props) => {
    let j_lastSeen = null;
    if(props.last_request_at){
        j_lastSeen = <p class="user__last_seen">{props.last_request_at}</p>
    }
    return (
        <div class="user__item <% selected ? print('disabled selected') : ''%>" id="<%= id %>">
            <span class="user__avatar m-user__img_<%= color %>">
                <i class="material-icons m-user_icon">account_circle</i>
            </span>
            <div class="user__details">
                <p class="user__name">{props.name}</p>
                {j_lastSeen}
            </div>
        </div>
    );
}
export default ChatUser;