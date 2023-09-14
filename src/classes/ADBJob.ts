import { join } from 'path';
import { type Client } from 'adb-ts/lib/client';

type SetInstallerScreenProps = {
    title: string,
    text: string,
    loading?: boolean,
    error?: boolean
}

export default class ADBJob {
    #jobs: Array<(adb: Client, serial: string) => any> = [];
    #mac_cache: string | undefined;

    installAPK(filename: string): ADBJob {
        this.#jobs.push((adb, serial) => adb.install(serial, join(process.cwd(), 'files', filename)));
        return this;
    }

    removePackage(identifier: string): ADBJob {
        this.#jobs.push((adb, serial) => adb.uninstall(serial, identifier));
        return this;
    }

    disablePackage(identifier: string): ADBJob {
        this.#jobs.push((adb, serial) => adb.execDeviceShell(serial, `pm disable-user --user 0 ${identifier}`));
        return this;
    }

    shell(cmd: string): ADBJob {
        this.#jobs.push((adb, serial) => adb.execDeviceShell(serial, cmd));
        return this;
    }

    async #getMac(adb: Client, serial: string): Promise<string> {
        if(this.#mac_cache)
            return this.#mac_cache;
        try {
            this.#mac_cache = await adb.execDeviceShell(serial, 'cat /sys/class/net/eth0/address');
            return this.#mac_cache as string;
        } catch(e) {
            try {
                this.#mac_cache = await adb.execDeviceShell(serial, 'cat /sys/class/net/wlan0/address');
                return this.#mac_cache as string;
            } catch(e) {
                return 'Unknown device';
            }
        }
    }

    async #setInstallerScreen(adb: Client, serial: string, { text, title, error, loading }: SetInstallerScreenProps): Promise<void> {
        await adb.killApp(serial, 'nl.wholesale_iptv.iptvinstaller');
        await adb.execDeviceShell(serial, `am start -n nl.wholesale_iptv.iptvinstaller/.MainActivity --es "title" "${title}" --es "text" "${text}" --es "loading" "${loading ? '1' : '0'}" --es "error" "${error ? '1' : '0'}" --es "device" "${await this.#getMac(adb, serial)}"`)
    }

    async __run(adb: Client, serial: string): Promise<void> {
        if(!await adb.isInstalled(serial, 'nl.wholesale_iptv.iptvinstaller'))
            await adb.install(serial, join(process.cwd(), 'files/installer.apk'));
        await this.#setInstallerScreen(adb, serial, {
            title: 'Preparing device',
            text: 'Please wait, this device is running installation tasks to install the IPTV Nederland software.'
        });
        let error: boolean = false;
        for(let job of this.#jobs)
            if(!error)
                try {
                    await job(adb, serial);
                } catch(e) {
                    error = true;
                    let err: string | null = null;
                    if(typeof e === "string")
                        err = e;
                    else if(typeof e === "object" && typeof (e as any).message === "string")
                        err = (e as any).message;
                    else
                        err = JSON.stringify(e);
                    await this.#setInstallerScreen(adb, serial, {
                        title: 'Something went wrong...',
                        text: err as string,
                        error: true
                    })
                }
        await this.#setInstallerScreen(adb, serial, {
            title: 'Done!',
            text: 'Installation is finished. This device is now ready to be used.'
        });
    }
}