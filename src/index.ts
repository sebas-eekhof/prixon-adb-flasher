import Bonjour from "bonjour";
import IPTVApi from "./classes/IPTVApi";
import fs from 'fs/promises';
import { join } from "path";
import devices from "./devices";
import { Client } from 'adb-ts';
import { type MakeDeviceProps } from "./utils/Device";

(async () => {
    const adb = new Client();
    console.log('[1] Downloading latest app versions');
    console.log('[1.1] Downloading launcher');
    await fs.writeFile(join(process.cwd(), 'files/launcher.apk'), await IPTVApi.download('nl.wholesale_iptv.launcher2'));
    console.log('[1.2] TV Player');
    await fs.writeFile(join(process.cwd(), 'files/player.apk'), await IPTVApi.download('nl.wholesale_iptv.player.tv'));
    console.log('[2] Listening for devices');
    const bonjour = Bonjour();
    bonjour.find({ type: 'adb', protocol: 'tcp' }, async (service) => {
        let the_device: MakeDeviceProps | undefined;
        for(let device of devices)
            if(device.test(service))
                the_device = device;
        if(the_device) {
            try {
                console.log(`Running installation on device: ${the_device.name}`);
                const serial = await adb.connect(`${service.referer.address}:${service.port}`);
                console.log(`Connected!`);
                await the_device.job.__run(adb, serial);
                console.log(`Finished!\n\n\n\n`);
            } catch(e) {
                console.log('Something went wrong...');
                console.log(e);
            }
        }
    })
})()