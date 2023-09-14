import ADBJob from "./classes/ADBJob";
import makeDevice from "./utils/Device";

export default [
    makeDevice({
        name: 'Prixon Prisma',
        test: service => service.name.startsWith('adb-T00'),
        job: (new ADBJob())
            .disablePackage('com.blomxprisma.launcher')
            .removePackage('com.dontvnew')
            .removePackage('com.rivumplayer')
            .installAPK('launcher.apk')
            .installAPK('player.apk')
    })
]