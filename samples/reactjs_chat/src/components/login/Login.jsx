import React, { Component } from 'react';
import QB from "quickblox/quickblox.min.js";
/** Importing assests */
import QBLogo from "./../../assets/img/qb-logo.svg";
import QBLogoGrey from "./../../assets/img/qblogo-grey.svg";

class Login extends Component {
    constructor() {
        super();
        this.version = QB.version + ':' + QB.buildNumber;
        console.log(QB);
    }
    render() {
        return (
            <div className="login__wrapper">
                <div className="login__container">
                    <div className="login__inner">
                        <div className="login__top">
                            <a href="https://quickblox.com/" className="login__logo">
                                <img src={QBLogo} alt="QuickBlox" />]
                            </a>
                            <h1>Quickblox Chat Sample</h1>
                            <h3>Please enter your username and user group. Users within the same group will be able to communicate, create chats with each other</h3>
                        </div>

                        <form name="loginForm" className="login__form">
                            <div className="login_form__row">
                                <label htmlFor="userName">User name</label>
                                <input type="text" id="userName" name="userName" />
                            </div>
                            <div className="login_form__row">
                                <label htmlFor="userGroup">User group</label>
                                <input type="text" id="userGroup" name="userGroup" />
                            </div>
                            <div className="login__button_wrap">
                                <button type="submit" name="login_submit" className="btn m-login__button j-login__button" disabled>login</button>
                            </div>
                        </form>
                    </div>
                    <div className="login__footer">
                        <div className="footer__logo_wrap">
                            <a href="https://quickblox.com/" className="footer__logo">
                                <img src={QBLogoGrey} alt="QuickBlox" />
                            </a>
                            <p>by QuickBlox</p>
                        </div>
                        <span className="footer__version">v.{this.version}</span>
                    </div>
                </div>
            </div>
        );
    }
}
        
export default Login;