const http = require('http');
const https = require('https');

const clients = {
    'http:': http,
    'https:': https
};

exports.request = function request(options) {
    const client = clients[options.protocol];

    if (!client) {
        throw new Error(`Error, protocol not supported: '${options.protocol}'.`);
    }

    return new Promise((resolve, reject) => {
        const request = client.request(options, callback);

        request.on('error', (error) => reject(error));
        request.end();

        function callback(response) {
            response.setEncoding('utf8');
            if (response.statusCode < 200 || response.statusCode >= 300) {
                reject(`Error: ${response.statusCode}, ${response.statusMessage}`);
            } else {
                let payload = '';

                response.on('error', (error) => reject(error));
                response.on('data', (chunk) => payload += chunk);
                response.on('end', () => resolve(payload));
            }
        }
    });
};
