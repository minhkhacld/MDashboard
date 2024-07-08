async function saveAttachment<t, d>(table: t, attachments: d[], MasterId): [t, d] {
    return new Promise((resolve) => {
        // console.log('saveAttachment', attachments);
        setTimeout(() => {
            const result = attachments
                .forEach(async (att) => {
                    // console.log(table, attachments);
                    if (att.Id < 0) {
                        const newAtt = { ...att, };
                        newAtt.Id = Math.abs(att.Id)
                        // console.log('newAtt', newAtt);
                        const itemExist = await table.get({ Id: newAtt.Id, });
                        // console.log('itemExist', itemExist);
                        if (itemExist) {
                            if (newAtt.Action === 'Delete') {
                                console.log('delete')
                                await table.where({ Id: newAtt.Id, MasterId }).delete();
                            } else {
                                if (newAtt.Data === null || newAtt.Data === "") return
                                console.log('update')
                                await table.where({ Id: newAtt.Id, MasterId }).modify((x, ref) => {
                                    ref.value = newAtt;
                                })
                            }
                        } else {
                            if (newAtt.Action === 'Delete') {
                                console.log('do nothing')
                            } else {
                                console.log('add', newAtt.Id)
                                await table.add(newAtt);
                            };
                        };
                    }
                });
            resolve(result);
        }, 1000)
    })
};


async function deleteAttachment<t, d>(table: t, attachments: d[], MasterId): [t, d] {
    return new Promise((resolve) => {
        setTimeout(() => {
            const result = attachments
                .forEach(async (att) => {
                    const newAtt = { ...att, };
                    newAtt.Id = Math.abs(att.Id)
                    await table.where({ Id: newAtt.Id, MasterId }).delete(res => console.log('delete count', res));
                });
            resolve(result);
        }, 1000)
    })
};




// for compliance line images popup processing;
async function updateImages(img, attachmentsDB, imgInDexDb) {
    try {
        // return `data:image/jpeg;base64,${base64ImageData}` || null;
        const imgExist = imgInDexDb.find((d) => d.Guid === img.Guid);
        // Delete if new image && id <0
        if ((imgExist && img.Action === 'Delete' && img.id < 0)) {
            attachmentsDB?.compliance
                .where('id')
                .equals(img.id)
                .delete()
                .then((deleteCount) => {
                    console.log('deleteCount', deleteCount);
                });
            return "DELETE"
        };

        // update if id >0 && action delete
        if ((imgExist && img.Action === 'Delete' && img.id > 0)) {
            attachmentsDB?.compliance
                .update(img.id, { Data: null, Action: 'Delete' })
            return "UPDATE"
        };


        // update if image is modify
        if ((imgExist && img.Action === 'Insert' && img.IsModify)) {
            attachmentsDB?.compliance
                .update(img.id, { Data: img.Data, })
            return "MODIFY"
        };

        // insert if image is new
        if (imgExist === undefined && img.Action === 'Insert') {
            attachmentsDB?.compliance.add(img);
            return "INSERT"
        };
        return "DO NOTHING";

    } catch (error) {
        console.error('Error fetching image data from the server:', error);
        return null
    }
}


// Mock function to simulate an asynchronous operation
function asyncOperation(img, attachmentsDB, imgInDexDb) {
    return new Promise(resolve => {
        // Simulating asynchronous operation (e.g., fetching data)
        setTimeout(() => {
            console.log(`Processed img: ${img.id}`);
            const result = updateImages(img, attachmentsDB, imgInDexDb)
            resolve(result);
        }, 100);
        // Adjust the timeout as needed
    });
}

// for add toto event
async function processArrayComplianceLineImages(images, attachmentsDB, imgInDexDb, setProcessProgress) {
    /* eslint-disable */
    // let result = [];
    let index = 0;
    for (const img of images) {
        index += 1
        if (setProcessProgress) {
            setProcessProgress(pre => ({
                ...pre,
                current: pre.current + 1,
            }))
        }

        const result = await asyncOperation(img, attachmentsDB, imgInDexDb);
        console.log(result)

        // result.push(item);
    };

    // Code here will only run after all items have been processed
    console.log('All image processed.');
    // return result
}


export { saveAttachment, deleteAttachment, processArrayComplianceLineImages }