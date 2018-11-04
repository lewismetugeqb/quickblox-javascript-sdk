import React, { Component } from 'react';
import QB from "quickblox/quickblox.min.js";
import _ from "underscore";

/** Importing Services */
import Helpers from "./../../services/Helpers.jsx";
import Auth from "./../../services/Auth.jsx";

/** Importing assests */
import QBLogo from "./../../assets/img/qb-logo.svg";
import QBLogoGrey from "./../../assets/img/qblogo-grey.svg";

/** Importing components */
import Loading from "./../loading/Loading.jsx";

class Login extends Component {
    constructor(props) {
        super(props);
        this.isLoginPageRendered = false;
        this.version = QB.version + ':' + QB.buildNumber;
        this.state = {
            isLoading: false,
            loginButton: "LOGIN"
        }
        this.init();
    }

    componentDidMount() {
        if(!this.state.isLoading){
            this.isLoginPageRendered = true;
            this.setListeners();
        }
    }
    
    init(){
        this.state.isLoading = true;
        Auth.init(this.props.getAppState).then((authResponse) => {
            if(authResponse.status){
                this.props.updateAppState(authResponse.appStateData);
                this.props.history.push('/dashboard');
            }else{
                this.setState({isLoading: false});
                this.componentDidMount();
            }
        }).catch((e) => {
            console.error(e);
        });
    }

    login(user) {
        return new Promise((resolve, reject) => {
            this.setState({loginButton: "loading..."});
            Auth.login(user).then((authResponse) => {
                resolve(authResponse);
            }).catch((e) => {
                reject(e);
            });
        });

    }

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

            this.login(user).then((loginResponse) => {
                this.props.updateAppState(loginResponse.appStateData);
                this.props.history.push('/dashboard');
            }).catch((error) => {
                alert('LOGIN ERROR\n open console to get more info');
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
        if(this.state.isLoading){
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