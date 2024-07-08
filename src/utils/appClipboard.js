import { Clipboard } from '@capacitor/clipboard';

const writeToClipboard = async (data) => {
    await Clipboard.write({
        string: data.toString(),
    }).then(res => console.log(res)).catch(err => console.log(err));
};

const checkClipboard = async () => {
    const { type, value } = await Clipboard.read();
    console.log(`Got ${type} from clipboard: ${value}`);
    return {
        type, value
    }
};

export {
    writeToClipboard, checkClipboard
} 