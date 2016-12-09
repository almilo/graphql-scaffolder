const url = require('url');
const httpClient = require('./http-client');
const GraphQLType = require('./graphql-type');

exports.generateAnnotatedSchema = function generateAnnotatedSchema(endpointUrl, customOptions = {}) {
    const options = Object.assign({}, url.parse(endpointUrl), customOptions);

    return httpClient.request(options)
        .then(payload => JSON.parse(payload))
        .then(jsonPayload => {
            const queryFieldName = createQueryFieldName(options) || 'request';
            const schemaTypes = generateSchemaTypes('query', {[queryFieldName]: jsonPayload});

            schemaTypes.Query.fields[queryFieldName].annotations.push(createRestAnnotation(options));

            return serializeSchemaTypes(schemaTypes);
        })
        .catch(error)
};

exports.generateSchema = function generateSchema(jsonPayload) {
    try {
        const schemaTypes = generateSchemaTypes('query', jsonPayload);
        const schema = serializeSchemaTypes(schemaTypes);

        return Promise.resolve(schema);
    } catch (error) {
        return Promise.reject(error);
    }
};

function serializeSchemaTypes(schemaTypes) {
    return Object.keys(schemaTypes).map(typeName => schemaTypes[typeName].toString()).join('\n');
}

function createQueryFieldName(options) {
    const pathFragments = options.pathname.split('/');
    const name = pathFragments[pathFragments.length - 1];

    const params = options.query
        ? '(' + options.query.split('&').map(toParam).join(', ') + ')'
        : '';

    return name && `${name}${params}`;

    function toParam(urlParam) {
        const [name, value] = urlParam.split('=');

        return `${name}: ${getScalarTypeName(typeof value)}`;
    }
}

function createRestAnnotation(options) {
    const urlWithoutParams = options.href.match(/[^\?]*/)[0];
    const args = {
        url: `"${urlWithoutParams}"`,
        customHeaders: options.headers && `[${serializeObject(options.headers)}]`
    };
    const serializedArgs = Object.keys(args)
        .map(argName => [argName, args[argName]])
        .filter(([argName, argValue]) => argValue !== undefined)
        .map(([argName, argValue]) => `${argName}: ${argValue}`)
        .join(', ');

    return `@rest(${serializedArgs})`;

    function serializeObject(objekt) {
        const list = Object.keys(objekt)
            .reduce((serializedHeaders, headerName) => {
                serializedHeaders.push(`"${headerName}: ${objekt[headerName]}"`);

                return serializedHeaders;
            }, []);

        return list.join(', ');
    }
}

function generateSchemaTypes(propertyName, propertyValue) {
    const types = {};

    parse(propertyName, propertyValue, types);

    return types;

    function parse(propertyDefinition, propertyValue, parsedTypes) {
        if (propertyValue === undefined || propertyValue === null) {
            return getType(propertyDefinition, {'empty_data': {type: 'String', annotations: []}}, parsedTypes);
        }

        const propertyValueType = typeOf(propertyValue);

        switch (propertyValueType) {
            case 'array':
                return `[${parse(propertyDefinition, propertyValue[0], parsedTypes)}]`;
                break;
            case 'object':
                const typeFields = Object.keys(propertyValue)
                    .reduce((typeFields, fieldName) => {
                        typeFields[fieldName] = {
                            type: parse(fieldName, propertyValue[fieldName], parsedTypes),
                            annotations: []
                        };

                        return typeFields;
                    }, {});

                return getType(propertyDefinition, typeFields, parsedTypes);
                break;
            default:
                return getScalarTypeName(propertyValueType);
        }
    }
}

function getType(propertyDefinition, typeFields, types) {
    const propertyName = propertyDefinition.match(/[^\(]*/)[0];

    let index = 1;
    let type = new GraphQLType(capitalise(propertyName), typeFields);

    let existingType = types[type.name];
    while (existingType && existingType.toString() !== type.toString()) {
        type = new GraphQLType(`${capitalise(propertyName)}${index++}`, typeFields);
        existingType = types[type.name];
    }

    if (!existingType) {
        types[type.name] = type;
    }

    return type.name;
}

function typeOf(value) {
    return isArray(value) ? 'array' : typeof value;
}

function getScalarTypeName(valueType) {
    return valueType === 'number' ? 'Int' : capitalise(valueType);
}

function error(error) {
    throw new Error(error);
}

function capitalise(text) {
    return `${text.slice(0, 1).toUpperCase()}${text.slice(1)}`;
}

function isArray(value) {
    return Object.prototype.toString.call(value) === '[object Array]'
}
