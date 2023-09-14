"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ADBJob_1 = __importDefault(require("./classes/ADBJob"));
const Device_1 = __importDefault(require("./utils/Device"));
exports.default = [
    (0, Device_1.default)({
        name: 'Prixon Prisma',
        test: service => service.name.startsWith('adb-T00'),
        job: (new ADBJob_1.default())
            .disablePackage('com.blomxprisma.launcher')
            .removePackage('com.dontvnew')
            .removePackage('com.rivumplayer')
            .installAPK('launcher.apk')
            .installAPK('player.apk')
    })
];
