import React, { Component } from 'react';

const Notification = (props) => {
    return (
        <div class="message__wrap" id="<%= id %>">
            <p class="m-notification_message">{ props.text }</p>
        </div>
    );
}
export default Notification;