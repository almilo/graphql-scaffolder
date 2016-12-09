# graphql-scaffolder

[![npm version](https://badge.fury.io/js/graphql-scaffolder.svg)](https://badge.fury.io/js/graphql-scaffolder)

## Examples

Makes a request to the given URL and produces a scaffold schema for the returned payload:

```
> graphql-scaffolder scaffold http://transport.opendata.ch/v1/locations?query=Basel*
```

Makes a request to the given URL sending custom headers (i.e.: some APIs require sending a User Agent):

```
> graphql-scaffolder scaffold https://api.github.com/search/users?q=almilo -h "User-Agent: Foo"   
```

Makes a request to the given URL sending custom headers (i.e.: some APIs require sending Authorization):

```
> graphql-scaffolder scaffold https://api.github.com/user/repos -h "Authorization: Basic 766as765s7dra76srd7a6sd76as5d7as6d=="   
```

Makes a request to the given URL with BASIC authorization:

```
> graphql-scaffolder scaffold https://api.github.com/user/repos -a "<username>:<password>"   
```

### Notes

This project has not yet been released in the npm registry so it can only be used from source:

```
> git clone https://github.com/almilo/graphql-scaffolder.git
> npm link grapqhql-scaffolder
> graphql-scaffolder scaffold http://transport.opendata.ch/v1/locations?query=Basel*
```

This project uses yarn instead of npm:

```
// install yarn globally
> npm i -g yarn

// install dependencies through yarn
> yarn   
```
