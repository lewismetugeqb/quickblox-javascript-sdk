import React, { Component } from 'react';

const MessageTyping = (props) => {
    let j_typingUsers = _.each(props.users, function(user){
        <span class="message__avatar <%- typeof user === 'number' ? 'm-typing_unknown m-typing_' + user : 'm-user__img_' + user.color %>">
            <i class="material-icons">account_circle</i>
        </span>
    });
    let j_fountainGs = null;
    if(props.users.length){
        j_fountainGs = (
            <div id="fountainG">
                <div id="fountainG_1" class="fountainG"></div>
                <div id="fountainG_2" class="fountainG"></div>
                <div id="fountainG_3" class="fountainG"></div>
            </div>
        );
    }
    return (
        <div class="message__wrap m-typing j-istyping" id="is__typing">
            { j_typingUsers }
            { j_fountainGs }
        </div>
    );
}
export default MessageTyping;