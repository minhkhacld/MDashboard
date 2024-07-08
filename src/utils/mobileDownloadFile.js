import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import axios from './axios';

export const capWriteFile = async (path, data,) => {
    await Filesystem.writeFile({
        path,
        data,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
    });
};

export const getBase64FromUrl = async (url, useAxios = true) => {
    if (useAxios) {
        const response = await axios.get(url, {
            responseType: "blob", headers: {
                'Content-type': 'image/*'
            }
        })
        return new Promise((resolve) => {
            const reader = new window.FileReader();
            reader.readAsDataURL(response.data);
            reader.onloadend = () => {
                const base64data = reader.result;
                resolve(base64data);
            };
        })
    }

    const accessToken = window.localStorage.getItem("accessToken");
    const data = await fetch(url, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        // mode: 'no-cors'
    }
    );
    const blob = await data.blob();
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
            const base64data = reader.result;
            resolve(base64data);
        };
    });




};