import React, { Component } from 'react';

const Messages = (props) => {
    let msgName = props.message.sender ? props.message.sender.name : 'unknown user (' + props.message.sender_id + ')';
    let j_msg = props.message.message ? <p class="message__text">{ props.message.message }</p> : null;
    let j_attachments = _.each(props.message.attachments, function(attachment){
        <img src="<%= attachment.src %>" alt="attachment" class="message_attachment" />
    });
    let j_attachmentsDiv;
    if(props.message.attachments.length){
        j_attachmentsDiv = <div class="message__attachments_wtap">{attachments}</div>
    }
    return (
        <div class="message__wrap" id="<%= message.id %>" data-status="<%= message.status %>">
            <span class="message__avatar m-user__img_<%= sender ? sender.color : 'not_loaded' %>">
                <i class="material-icons">account_circle</i>
            </span>
            <div class="message__content">
                <div class="message__sender_and_status">
                    <p class="message__sender_name">{ msgName }</p>
                    <p class="message__status j-message__status">{ props.message.status }</p>
                </div>
                <div class="message__text_and_date">
                    <div class="message__text_wrap">
                        { j_msg }
                        { j_attachments }
                    </div>
                    <div class="message__timestamp">
                        { props.message.date_sent }
                    </div>
                </div>
            </div>
        </div>
    );
}
export default Messages;