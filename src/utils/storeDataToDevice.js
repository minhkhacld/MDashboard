import { Capacitor } from "@capacitor/core";
import { Directory, Encoding, Filesystem, } from "@capacitor/filesystem";


function CheckFileSystemPermission() {
    if (Capacitor.getPlatform() === 'web') return
    const result = Filesystem.checkPermissions();
    console.log('Filesystem.checkPermissions', JSON.stringify(result))
    if (result === 'granted' || result?.publicStorage === 'granted' || Object.keys(result).length === 0) {
        console.log('Filesystem permission granted!');
    } else {
        Filesystem.requestPermissions().then(res => console.log(res))
    }
}

export default CheckFileSystemPermission

const capacitorMkdir = async () => {
    try {
        const ret = await Filesystem.mkdir({
            path: 'msystem',
            directory: Directory.Documents,
            recursive: true, // like mkdir -p
        });
        console.log('Filesystem.mkdir', JSON.stringify(ret));
    } catch (e) {
        console.error('Unable to make directory', e);
    }
}

const capacitorFileWrite = async (file) => {
    try {
        const result = await Filesystem.writeFile({
            path: 'msystem/backup.txt',
            data: JSON.stringify(file),
            directory: Directory.Documents,
            encoding: Encoding.UTF8
        })
        console.log('Wrote file', JSON.stringify(result));
    } catch (e) {
        console.error('Unable to write file', e);
    }
}

const handleBackup = async (file) => {

    // IF FILE EXIST
    await Filesystem.readFile({
        path: 'msystem/backup.txt',
        directory: Directory.Documents,
        // directory: Directory.Cache,
        encoding: Encoding.UTF8
    }).then(async readRs => {

        console.log('readRs', JSON.stringify(readRs));
        if (readRs?.data) {
            await Filesystem.deleteFile({
                path: 'msystem/backup.txt',
                directory: Directory.Documents,
                // directory: Directory.Cache,
            }).then((delRs) => {
                console.log('deleted file', JSON.stringify(delRs));
                capacitorFileWrite(file)
            })
        };
        // IF FILE DOES NOT EXIST THEN

    }).catch(async err => {
        console.log('error read', JSON.stringify(err));
        capacitorMkdir().then(mkdirRs => {
            console.log('create new folder msystem');
            capacitorFileWrite(file)
        }).catch(async err => {
            console.log('error mkdirRs', JSON.stringify(err));
            await Filesystem.deleteFile({
                path: 'msystem/backup.txt',
                directory: Directory.Documents,
                // directory: Directory.Cache,
            }).then((delRs) => {
                console.log('deleted file', JSON.stringify(delRs));
                capacitorFileWrite(file)
            })
        });
    });

};


export {
    capacitorFileWrite, capacitorMkdir, handleBackup
};

