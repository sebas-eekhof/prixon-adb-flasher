import axios from "axios";

export default class IPTVApi {
    static async download(app: string): Promise<Buffer> {
        const res = await axios.request({
            url: `https://android-l.wholesale-iptv.nl/download/latest?package_id=${app}`,
            responseType: 'arraybuffer'
        });
        return res.data;
    }
}