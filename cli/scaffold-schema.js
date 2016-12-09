const fs = require('fs');
const path = require('path');
const schemaGenerator = require('../lib/schema-generator');

module.exports = function generateSchema(yargs) {
    return yargs
        .command(
            'scaffold [json-file-or-url]',
            'create a GraphQL schema for a JSON response or a HTTP request.',
            {
                'json-file-or-url': {
                    type: 'string',
                    normalize: true,
                    describe: 'a file with a JSON response or a HTTP service URL'
                },
                auth: {
                    alias: 'a',
                    type: 'string',
                    describe: `auth information: -a "user:password"`
                },
                headers: {
                    alias: 'h',
                    type: 'array',
                    describe: `custom headers: -h "User-Agent: foo" "Authorization: Basic abcdef1234567890"`
                },
            },
            (argv) => {
                const jsonFileOrUrl = argv['json-file-or-url'];

                if (fs.existsSync(jsonFileOrUrl)) {
                    const filePath = path.resolve(jsonFileOrUrl);
                    const jsonPayload = require(filePath);

                    schemaGenerator.generateSchema(jsonPayload)
                        .then(schema => console.log(schema))
                        .catch(error);
                } else {
                    const customOptions = {};

                    if (argv.headers) {
                        customOptions.headers = argv.headers.reduce((headers, header) => {
                            const [headerName, headerValue] = header.split(':');

                            headers[headerName.trim()] = headerValue.trim();

                            return headers;
                        }, {});
                    }

                    if (argv.auth) {
                        customOptions.auth = argv.auth
                    }

                    schemaGenerator.generateAnnotatedSchema(jsonFileOrUrl, customOptions)
                        .then(schema => console.log(schema))
                        .catch(error);
                }
            }
        );
};

function error(error) {
    throw new Error(error);
}
