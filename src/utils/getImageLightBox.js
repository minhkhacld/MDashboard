import { QC_ATTACHEMENTS_HOST_API } from "../config";
// eslint-disable-next-line 
export const getImageLightBox = (source = [], url) => {
    let result = []
    if (source.length > 0) {
        result = source.filter((d) => {
            function extension(filename) {
                const r = /.+\.(.+)$/.exec(filename);
                return r ? r[1] : null;
            }
            const fileExtension = extension(d.Name);
            const isImage = ['jpeg', 'png', 'jpg', 'gif', 'webp', 'avif'].includes(fileExtension.toLowerCase());
            return isImage && d?.Action !== 'Delete';
        }).map((_image) => {
            if (url === "Data") {
                return `${_image[url]}`
            }
            return `${QC_ATTACHEMENTS_HOST_API}/${_image?.Guid}`
        });
        return result;
    }
    return result;
}

