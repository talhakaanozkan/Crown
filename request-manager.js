const { request } = require("league-connect");
const sleep = require("util").promisify(setTimeout);

class RequestManager {
    static credentials;

    static init(credentials) {
        this.credentials = credentials;
    }
    static async tryRequest(method, path, data) { 
        try {
            return await request({
                    method: method,
                    url: path,
                    body:data
                }, this.credentials)
                .then(resp => resp.json());
        } catch(error) {
            return error;
        }
    }

    static async pollRequest(method, path, pollInterval) {
        let result = await this.tryRequest(method, path);
        while (result.errno != undefined || result.errorCode != undefined) {
            await sleep(pollInterval);
            result = await this.tryRequest(method, path);
        }
        return result;
    }

    static async tryRequestImage(path) {
        try {
            return request({
                    method: "GET",
                    url: path
                }, this.credentials)
                .then(async resp => {
                    if (resp.status >= 400) return resp;
                    return resp.buffer();
                })
                .then(buff => { 
                    if (!buff.status) return buff.toString("base64");
                    return buff;
                });
        } catch(error) {
            return error;
        }
    }
}

module.exports = RequestManager;