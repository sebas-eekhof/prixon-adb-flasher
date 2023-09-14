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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bonjour_1 = __importDefault(require("bonjour"));
const IPTVApi_1 = __importDefault(require("./classes/IPTVApi"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = require("path");
const devices_1 = __importDefault(require("./devices"));
const adb_ts_1 = require("adb-ts");
(() => __awaiter(void 0, void 0, void 0, function* () {
    const adb = new adb_ts_1.Client();
    console.log('[1] Downloading latest app versions');
    console.log('[1.1] Downloading launcher');
    yield promises_1.default.writeFile((0, path_1.join)(process.cwd(), 'files/launcher.apk'), yield IPTVApi_1.default.download('nl.wholesale_iptv.launcher2'));
    console.log('[1.2] TV Player');
    yield promises_1.default.writeFile((0, path_1.join)(process.cwd(), 'files/player.apk'), yield IPTVApi_1.default.download('nl.wholesale_iptv.player.tv'));
    console.log('[2] Listening for devices');
    const bonjour = (0, bonjour_1.default)();
    bonjour.find({ type: 'adb', protocol: 'tcp' }, (service) => __awaiter(void 0, void 0, void 0, function* () {
        let the_device;
        for (let device of devices_1.default)
            if (device.test(service))
                the_device = device;
        if (the_device) {
            try {
                console.log(`Running installation on device: ${the_device.name}`);
                const serial = yield adb.connect(`${service.referer.address}:${service.port}`);
                console.log(`Connected!`);
                yield the_device.job.__run(adb, serial);
                console.log(`Finished!\n\n\n\n`);
            }
            catch (e) {
                console.log('Something went wrong...');
                console.log(e);
            }
        }
    }));
}))();
