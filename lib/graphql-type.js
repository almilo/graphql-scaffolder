module.exports = class GraphQLType {
    constructor(name, fields) {
        this.name = name;
        this.fields = fields;
    }

    toString() {
        const serializedFields = Object.keys(this.fields)
            .map(fieldName => {
                const field = this.fields[fieldName];
                const serializedAnnotations = field.annotations.join(' ');

                return `${fieldName}: ${field.type} ${serializedAnnotations}`
            })
            .join('\n    ');

        return `type ${this.name} {\n    ${serializedFields}\n}\n`;
    }
};
