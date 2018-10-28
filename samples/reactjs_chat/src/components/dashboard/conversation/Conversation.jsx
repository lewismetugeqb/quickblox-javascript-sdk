import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import QB from "quickblox/quickblox.min.js";

class Conversation extends Component {
    constructor() {
        super();
        this.state = {
            _id: 1,
            title: "Lando Freeman",
            name: "Lando",
            color: "red",
            type:  1
        }
    }
    render() {
        return (
            <div className="content j-content">
                <div class="content__title j-content__title j-dialog">
                    <button class="open_sidebar j-open_sidebar"></button>
                    <h1 class="dialog__title j-dialog__title">{ this.state.title }</h1>
                    <div class="action_links">
                        <a href="#!/dialog/<%- _id %>/edit" class="add_to_dialog j-add_to_dialog <% type !== 2 ? print('hidden') : ''%>">
                            <i class="material-icons">person_add</i>
                        </a>
                        <a href="#" class="quit_fom_dialog_link j-quit_fom_dialog_link <% type === 1 ? print('hidden') : ''%>" data-dialog="<%- _id %>">
                            <i class="material-icons">delete</i>
                        </a>
                    </div>
                </div>
                <div class="notifications j-notifications hidden"></div>
                <div class="content__inner j-content__inner">
                    <div class=" messages j-messages"></div>
                    <form name="send_message" class="send_message" autocomplete="off">
                            <textarea name="message_feald" class="message_feald" id="message_feald" autocomplete="off"
                                      autocorrect="off" autocapitalize="off" placeholder="Type a message" autofocus></textarea>
                        <div class="message__actions">
                            <div class="attachments_preview j-attachments_preview"></div>
                            <label for="attach_btn" class="attach_btn">
                                <i class="material-icons">attachment</i>
                                <input type="file" id="attach_btn" name="attach_file" class="attach_input" accept="image/*"/>
                            </label>
                            <button class="send_btn">send</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}
        
export default Conversation;