"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _ADBJob_instances, _ADBJob_jobs, _ADBJob_mac_cache, _ADBJob_getMac, _ADBJob_setInstallerScreen;
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
class ADBJob {
    constructor() {
        _ADBJob_instances.add(this);
        _ADBJob_jobs.set(this, []);
        _ADBJob_mac_cache.set(this, void 0);
    }
    installAPK(filename) {
        __classPrivateFieldGet(this, _ADBJob_jobs, "f").push((adb, serial) => adb.install(serial, (0, path_1.join)(process.cwd(), 'files', filename)));
        return this;
    }
    removePackage(identifier) {
        __classPrivateFieldGet(this, _ADBJob_jobs, "f").push((adb, serial) => adb.uninstall(serial, identifier));
        return this;
    }
    disablePackage(identifier) {
        __classPrivateFieldGet(this, _ADBJob_jobs, "f").push((adb, serial) => adb.execDeviceShell(serial, `pm disable-user --user 0 ${identifier}`));
        return this;
    }
    shell(cmd) {
        __classPrivateFieldGet(this, _ADBJob_jobs, "f").push((adb, serial) => adb.execDeviceShell(serial, cmd));
        return this;
    }
    __run(adb, serial) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield adb.isInstalled(serial, 'nl.wholesale_iptv.iptvinstaller')))
                yield adb.install(serial, (0, path_1.join)(process.cwd(), 'files/installer.apk'));
            yield __classPrivateFieldGet(this, _ADBJob_instances, "m", _ADBJob_setInstallerScreen).call(this, adb, serial, {
                title: 'Preparing device',
                text: 'Please wait, this device is running installation tasks to install the IPTV Nederland software.'
            });
            let error = false;
            for (let job of __classPrivateFieldGet(this, _ADBJob_jobs, "f"))
                if (!error)
                    try {
                        yield job(adb, serial);
                    }
                    catch (e) {
                        error = true;
                        let err = null;
                        if (typeof e === "string")
                            err = e;
                        else if (typeof e === "object" && typeof e.message === "string")
                            err = e.message;
                        else
                            err = JSON.stringify(e);
                        yield __classPrivateFieldGet(this, _ADBJob_instances, "m", _ADBJob_setInstallerScreen).call(this, adb, serial, {
                            title: 'Something went wrong...',
                            text: err,
                            error: true
                        });
                    }
            yield __classPrivateFieldGet(this, _ADBJob_instances, "m", _ADBJob_setInstallerScreen).call(this, adb, serial, {
                title: 'Done!',
                text: 'Installation is finished. This device is now ready to be used.'
            });
        });
    }
}
_ADBJob_jobs = new WeakMap(), _ADBJob_mac_cache = new WeakMap(), _ADBJob_instances = new WeakSet(), _ADBJob_getMac = function _ADBJob_getMac(adb, serial) {
    return __awaiter(this, void 0, void 0, function* () {
        if (__classPrivateFieldGet(this, _ADBJob_mac_cache, "f"))
            return __classPrivateFieldGet(this, _ADBJob_mac_cache, "f");
        try {
            __classPrivateFieldSet(this, _ADBJob_mac_cache, yield adb.execDeviceShell(serial, 'cat /sys/class/net/eth0/address'), "f");
            return __classPrivateFieldGet(this, _ADBJob_mac_cache, "f");
        }
        catch (e) {
            try {
                __classPrivateFieldSet(this, _ADBJob_mac_cache, yield adb.execDeviceShell(serial, 'cat /sys/class/net/wlan0/address'), "f");
                return __classPrivateFieldGet(this, _ADBJob_mac_cache, "f");
            }
            catch (e) {
                return 'Unknown device';
            }
        }
    });
}, _ADBJob_setInstallerScreen = function _ADBJob_setInstallerScreen(adb, serial, { text, title, error, loading }) {
    return __awaiter(this, void 0, void 0, function* () {
        yield adb.killApp(serial, 'nl.wholesale_iptv.iptvinstaller');
        yield adb.execDeviceShell(serial, `am start -n nl.wholesale_iptv.iptvinstaller/.MainActivity --es "title" "${title}" --es "text" "${text}" --es "loading" "${loading ? '1' : '0'}" --es "error" "${error ? '1' : '0'}" --es "device" "${yield __classPrivateFieldGet(this, _ADBJob_instances, "m", _ADBJob_getMac).call(this, adb, serial)}"`);
    });
};
exports.default = ADBJob;
