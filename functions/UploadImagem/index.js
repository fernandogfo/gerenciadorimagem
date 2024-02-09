const mySecretKey = process.env.STORAGE_ACCESS_KEY;

const moment = require('moment');
const sizeOf = require('image-size');
const azure = require('azure-storage');
const blobService = azure.createBlobService(mySecretKey);
const { Readable } = require('stream');

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    try {

        const containerName = 'images';

        // Decodifica a string base64 para um buffer
        const buffer = Buffer.from(req.body.imagem, 'base64');

        // Converte o buffer em um stream legível
        const stream = Readable.from(buffer);

        // Calcula o comprimento do stream
        const streamLength = buffer.length;

        const format = capturarFormatoImagem(buffer);

        const blobName = 'originais/imagem-' + dataAtual() + format;

        await new Promise((resolve, reject) => {
            blobService.createBlockBlobFromStream(containerName, blobName, stream, streamLength, (error, result, response) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({ result, response });
                }
            });
        });

        const dimensions = sizeOf(buffer);

        const metadata = {
            // Adicione seus metadados aqui
            formato: format,
            dataUpload: dataAtual(),
            tamanho_original: buffer.length,
            dimensao_original: dimensions.width + 'x' + dimensions.height

        };

        blobService.setBlobMetadata(containerName, blobName, metadata, function(error, result, response) {
            if (error) {
                // Trate o erro
                console.error('Error setting metadata:', error);
            } else {
                // Metadados definidos com sucesso
                console.log('Metadata set successfully!');
            }
        });

        context.res = {
            status: 200,
            body: 'Image uploaded successfully!',
        };
    } catch (error) {
        context.log.error('Error uploading image:', error);
        context.res = {
            status: 500,
            body: 'Error uploading image.',
        };
    }

    function capturarFormatoImagem(buffer) {
        // Analisar os primeiros bytes para determinar o formato
        let formato = "";
        if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
            formato = ".jpeg";
        } else if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
            formato = ".png";
        } else if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
            formato = ".gif";
        } else if (buffer[0] === 0x42 && buffer[1] === 0x4D) {
            formato = ".bmp";
        } else {
            formato = ".jpg";
        }

        return formato;
    }

    function dataAtual(){
        return moment(Date.now()).format('DD-MM-YYYY-mm-dd');
    }
};