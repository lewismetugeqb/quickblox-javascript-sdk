import React, { Component } from 'react';
import QB from "quickblox/quickblox.min.js";
import _ from "underscore";
/** Importing assests */
import QBLogo from "./../../assets/img/qb-logo.svg";
import QBLogoGrey from "./../../assets/img/qblogo-grey.svg";

import Loading from "./../loading/Loading.jsx";

import Helpers from "./../../services/Helpers.jsx";

class Login extends Component {
    constructor() {
        super();

        this.isLoginPageRendered = false;
        this.isLogin = false;
        this.isLoading = false;
        this.app = {};
        this.state = {
            loginButton: "LOGIN"
        }
    }

    componentDidMount() {
        this.isLoginPageRendered = true;
        console.log(this.refs.loginForm.userName);
        this.setListeners();
    }

    init(){
        return new Promise((resolve, reject) => {
            let user = localStorage.getItem('user');
            if(user && !this.app.user){
                let savedUser = JSON.parse(user);
                this.app.room = savedUser.tag_list;
                this.login(savedUser).then(() => {
                    resolve(true);
                }).catch((error) => {
                    reject(error);
                });
            } else {
                resolve(false);
            }
        });
    }

    login(user) {
        return new Promise((resolve, reject) => {
            if(this.isLoginPageRendered){
                this.setState({loginButton: "loading..."});
            } else {
                console.log("Login Page Not Rendered");
            }
            QB.createSession((csErr, csRes) => {
                let userRequiredParams = {
                    'login': user.login,
                    'password': user.password
                };
                if (csErr) {
                    loginError(csErr);
                } else {
                    this.app.token = csRes.token;
                    QB.login(userRequiredParams, (loginErr, loginUser) => {
                        if(loginErr) {
                            /** Login failed, trying to create account */
                            QB.users.create(user, (createErr, createUser) => {
                                if (createErr) {
                                    loginError(createErr);
                                } else {
                                    QB.login(userRequiredParams, (reloginErr, reloginUser) => {
                                        if (reloginErr) {
                                            loginError(reloginErr);
                                        } else {
                                            loginSuccess(reloginUser);
                                        }
                                    });
                                }
                            });
                        } else {
                            /** Update info */
                            if(loginUser.user_tags !== user.tag_list || loginUser.full_name !== user.full_name) {
                                QB.users.update(loginUser.id, {
                                    'full_name': user.full_name,
                                    'tag_list': user.tag_list
                                }, function(updateError, updateUser) {
                                    if(updateError) {
                                        loginError(updateError);
                                    } else {
                                        loginSuccess(updateUser);
                                    }
                                });
                            } else {
                                loginSuccess(loginUser);
                            }
                        }
                    });
                }
            });

            function loginSuccess(userData){
                app.user = userModule.addToCache(userData);
                app.user.user_tags = userData.user_tags;
                QB.chat.connect({userId: app.user.id, password: user.password}, function(err, roster){
                    if (err) {
                        document.querySelector('.j-login__button').innerText = 'Login';
                        console.error(err);
                        reject(err);
                    } else {
                        self.isLogin = true;
                        resolve();
                    }
                });
            }

            function loginError(error){
                self.renderLoginPage();
                console.error(error);
                alert(error + "\n" + error.detail);
                reject(error);
            }
        });

    };

    setListeners(){
        let loginForm = this.refs.loginForm,
            formInputs = [loginForm.userName, loginForm.userGroup],
            loginBtn = loginForm.login_submit;

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            if(loginForm.hasAttribute('disabled')){
                return false;
            } else {
                loginForm.setAttribute('disabled', true);
            }

            let userName = loginForm.userName.value.trim(),
                userGroup = loginForm.userGroup.value.trim();

            let user = {
                login: Helpers.getUui(),
                password: 'webAppPass',
                full_name: userName,
                tag_list: userGroup
            };

            localStorage.setItem('user', JSON.stringify(user));

            this.login(user).then(() => {
                this.props.history.push('/dashboard')
            }).catch((error) => {
                alert('lOGIN ERROR\n open console to get more info');
                loginBtn.removeAttribute('disabled');
                console.error(error);
                this.setState({loginButton: 'LOGIN'});
            });
        });

    // add event listeners for each input;
        _.each(formInputs, (i) => {
            i.addEventListener('focus', (e) => {
                let elem = e.currentTarget,
                    container = elem.parentElement;

                if (!container.classList.contains('filled')) {
                    container.classList.add('filled');
                }
            });

            i.addEventListener('focusout', (e) => {
                var elem = e.currentTarget,
                    container = elem.parentElement;

                if (!elem.value.length && container.classList.contains('filled')) {
                    container.classList.remove('filled');
                }
            });

            i.addEventListener('input', () => {
                var userName = loginForm.userName.value.trim(),
                    userGroup = loginForm.userGroup.value.trim();
                if(userName.length >= 3 && userGroup.length >= 3){
                    loginBtn.removeAttribute('disabled');
                } else {
                    loginBtn.setAttribute('disabled', true);
                }
            });
        });
    };
    
    render() {
        if(this.isLoading){
            return (<Loading />);
        }
        return (
            <div className="login__wrapper">
                <div className="login__container">
                    <div className="login__inner">
                        <div className="login__top">
                            <a href="https://quickblox.com/" className="login__logo">
                                <img src={QBLogo} alt="QuickBlox" />]
                            </a>
                            <h1 ref="testRef">Quickblox Chat Sample</h1>
                            <h3>Please enter your username and user group. Users within the same group will be able to communicate, create chats with each other</h3>
                        </div>

                        <form ref="loginForm" name="loginForm" className="login__form">
                            <div className="login_form__row">
                                <label htmlFor="userName">User name</label>
                                <input type="text" id="userName" name="userName" />
                            </div>
                            <div className="login_form__row">
                                <label htmlFor="userGroup">User group</label>
                                <input type="text" id="userGroup" name="userGroup" />
                            </div>
                            <div className="login__button_wrap">
                                <button type="submit" name="login_submit" className="btn m-login__button j-login__button" disabled>{ this.state.loginButton }</button>
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