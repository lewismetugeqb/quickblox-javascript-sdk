import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import QB from "quickblox/quickblox.min.js";

/** Importing Sub Components. */
import Welcome from "./Welcome.jsx";
import Conversation from "./conversation/Conversation.jsx"
import UserConversations from "./user-conversations/UserConversations.jsx";

/** Importing assests */
import QBLogo from "./../../assets/img/qb-logo.svg";
import QBLogoGrey from "./../../assets/img/qblogo-grey.svg";

class Dashboard extends Component {
    constructor() {
        super();
        this.version = QB.version + ':' + QB.buildNumber;
        this.user = {
            user_tags: "Test Group",
            name: "Lando"
        }
        console.log(QB);
    }
    render() {
        return (
            <div className="dashboard">
                <div className="sidebar j-sidebar active">
                    <div className="sidebar__inner">
                        <div className="sidebar__header">
                            <a href="https://quickblox.com/" className="dashboard__logo">
                                <img src={QBLogo} alt="QuickBlox" />
                            </a>
                            <div className="dashboard__status_wrap">
                                <h2 className="dashboard__title">{this.user.user_tags}</h2>
                                <p className="dashboard__status j-dashboard_status">Logged in as {this.user.name}</p>
                            </div>
                            <a href="#" className="logout j-logout">logout</a>
                        </div>
                        <div className="sidebar__content">
                            <ul className="sidebar__tabs">
                                <li className="sidebar__tab">
                                    <a href="#" className="sidebar__tab_link j-sidebar__tab_link"  data-type="chat">chats</a>
                                </li>
                                <li className="sidebar__tab">
                                    <a href="#" className="sidebar__tab_link j-sidebar__tab_link" data-type="public">public chats</a>
                                </li>
                                <li className="sidebar__tab m-sidebar__tab_new">
                                    <a href="#!/dialog/create" className="sidebar__tab_link j-sidebar__create_dialog m-sidebar__tab_link_new" data-type="create">
                                        <i className="material-icons">add_circle_outline</i>
                                    </a>
                                </li>
                            </ul>
                            <ul className="sidebar__dilog_list j-sidebar__dilog_list">
                                <UserConversations />
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="content j-content" ref="jContent">
                    <Route exact path="/dashboard" component={Welcome} />
                    <Route path="/dashboard/dialog" component={Conversation} />
                </div>
            </div>
        );
    }
}
        
export default Dashboard;