const azure = require('azure-storage');
const Jimp = require('jimp');
const streamToBuffer = require('stream-to-buffer');
const mySecretKey = process.env.STORAGE_ACCESS_KEY;

const blobService = azure.createBlobService(mySecretKey);
module.exports = async function (context, req) {

    context.res = {
        status: 200,
        body: await getImages('images'),
    };
}

async function getImagesFromAzure(containerName, folderName) {

    let continuationToken = null;
    let blobs = [];

    do {
        const result = await new Promise((resolve, reject) => {
            blobService.listBlobsSegmentedWithPrefix(containerName, folderName, continuationToken, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });

        blobs.push(...result.entries);
        continuationToken = result.continuationToken;
    } while (continuationToken);

    return blobs;
}

async function getBase64Images(containerName, folderName) {
    const blobs = await getImagesFromAzure(containerName, folderName);
    const images = [];

    for (const blob of blobs) {
        const stream = blobService.createReadStream(containerName, blob.name);
        const buffer = await new Promise((resolve, reject) => {
            streamToBuffer(stream, (err, buffer) => {
                if (err) reject(err);
                else resolve(buffer);
            });
        });
        const image = await Jimp.read(buffer);
        const base64Image = await image.getBase64Async(Jimp.AUTO);

        images.push({
            imagem: base64Image,
            dimensoes: `${image.bitmap.width}x${image.bitmap.height}`
        });
    }

    return images;
}

async function getImages(containerName) {
    const originais = await getBase64Images(containerName, 'originais/');
    const redimensionadas = await getBase64Images(containerName, 'redimencionadas/');

    return {
        originais,
        redimensionadas
    };
}
