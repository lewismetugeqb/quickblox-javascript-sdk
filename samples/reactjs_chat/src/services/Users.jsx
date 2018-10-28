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
    };
}

export default Users;