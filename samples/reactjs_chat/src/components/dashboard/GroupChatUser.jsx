import React, { Component } from 'react';

const GroupChatUser = (props) => {
    let j_lastSeen = null;
    if(props.user.last_request_at){
        j_lastSeen = <p class="user__last_seen">{props.user.last_request_at}</p>
    }
    return (
        <div class="user__item <% user.selected ? print('disabled selected') : ''%>" id="<%= user.id %>">
            <span class="user__avatar m-user__img_<%= user.color %>">
                <i class="material-icons m-user_icon">account_circle</i>
            </span>
            <div class="user__details">
                <p class="user__name">{props.user.name}</p>
                {j_lastSeen}
            </div>
        </div>
    );
}
export default GroupChatUser;