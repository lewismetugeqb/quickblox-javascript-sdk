import React, { Component } from 'react';

const Notification = (props) => {
    return (
        <div className="message__wrap" id={ props.id }>
            <p className="m-notification_message">{ props.text }</p>
        </div>
    );
}
export default Notification;