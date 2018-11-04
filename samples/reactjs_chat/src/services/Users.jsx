import QB from "quickblox/quickblox.min.js";
import _ from "underscore";

class Users {
    static _cache  = {};
    static userListConteiner = null;
    static content = null;

    static addToCache(user) {
        let id = user.id;
        if (!this._cache[id]) {
            this._cache[id] = {
                name: user.full_name || user.login || 'Unknown user (' + id + ')',
                id: id,
                color: _.random(1, 10),
                last_request_at: user.last_request_at
            };
        } else {
            this._cache[id].last_request_at = user.last_request_at;
        }

        return this._cache[id];
    }

    static getUsersByIds(userList) {
        var params = {
                filter: {
                    field: 'id',
                    param: 'in',
                    value: userList
                },
                per_page: 100
            };

        return new Promise((resolve, reject) => {
            QB.users.listUsers(params, (err, response) => {
                if (err) {
                    reject(err);
                } else {
                    let users = response.items;

                    _.each(userList, (id) => {
                        let user = users.find((item) => {
                            return item.user.id === id;
                        });

                        if(user !== undefined) {
                            this.addToCache(user.user);
                        }
                    });
                    resolve(true);
                }
            });
        });
    }

    static getUsers(user_tags) {
        let params = {
                tags: user_tags,
                per_page: 100
            };

        return new Promise((resolve, reject) => {
            QB.users.get(params, (err, response) => {
                if (err) {
                    reject(err);
                }

                let userList = response.items.map((data) => {
                    return this.addToCache(data.user);
                });

                resolve(userList);
            });
        });
    };
}

export default Users;