import QB from "quickblox/quickblox.min.js";

/** Importing Services */
import Users from "./Users.jsx";

class Auth {
    static isLogin = false;
    static isDashboardLoaded = false;
    static appStateData = {};
    
    static init(app){
        return new Promise((resolve, reject) => {
            let user = localStorage.getItem('user');
            if(user && !app.user){
                let savedUser = JSON.parse(user);
                this.appStateData.room = savedUser.tag_list;
                this.login(savedUser).then(() => {
                    resolve({status: true, appStateData: this.appStateData});
                }).catch((error) => {
                    reject(error);
                });
            } else {
                resolve({status: false, appStateData: this.appStateData});
            }
        });
    }

    static login(user) {
        /** setting 'this' to 'that' since the nesting of 'this' in QB callbacks will cause conflicts.  */
        let that = this;
        return new Promise((resolve, reject) => {
            console.info("QuickBlox logging user in...");
            QB.createSession((csErr, csRes) => {
                let userRequiredParams = {
                    'login': user.login,
                    'password': user.password
                };
                if (csErr || !csRes) {
                    that.loginError(csErr, reject);
                } else {
                    console.log(csErr, csRes);
                    that.appStateData.token = csRes.token;
                    QB.login(userRequiredParams, (loginErr, loginUser) => {
                        if(loginErr) {
                            /** Login failed, trying to create account */
                            QB.users.create(user, (createErr, createUser) => {
                                if (createErr) {
                                    that.loginError(createErr, reject);
                                } else {
                                    QB.login(userRequiredParams, (reloginErr, reloginUser) => {
                                        if (reloginErr) {
                                            that.loginError(reloginErr, reject);
                                        } else {
                                            that.loginSuccess(reloginUser, user, resolve, reject);
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
                                        that.loginError(updateError, reject);
                                    } else {
                                        that.loginSuccess(updateUser, user, resolve, reject);
                                    }
                                });
                            } else {
                                that.loginSuccess(loginUser, user, resolve, reject);
                            }
                        }
                    });
                }
            });
        });

    }

    static loginSuccess(userData, user, resolve, reject){
        this.appStateData.user = Users.addToCache(userData);
        this.appStateData.user.user_tags = userData.user_tags;
        QB.chat.connect({userId: this.appStateData.user.id, password: user.password}, (err, roster) => {
            if (err) {
                console.info("QuickBlox login failed...");
                reject(err);
            } else {
                this.isLogin = true;
                console.info("QuickBlox login successfull...");
                resolve({
                    status: null,
                    appStateData: this.appStateData,
                    isLogin: this.isLogin
                });
            }
        });
    }

    static loginError(error, reject){
        console.info("QuickBlox login failed...");
        reject(error);
    }
}

export default Auth;