class Helpers {
    static getUui(){
        let navigatorInfo = window.navigator;
        let screenInfo = window.screen;
        var uid = 'chat' + navigatorInfo.mimeTypes.length;

        uid += navigatorInfo.userAgent.replace(/\D+/g, '');
        uid += navigatorInfo.plugins.length;
        uid += screenInfo.height || '';
        uid += screenInfo.width || '';
        uid += screenInfo.pixelDepth || '';

        return uid;
    }
}

export default Helpers;