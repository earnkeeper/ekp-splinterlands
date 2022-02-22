# Splinterlands EarnKeeper.io Plugin

The (EarnKeeper.io)[https://github.com/earnkeeper] plugin for [Splinterlands](https://splintlerands.com/).

This plugin uses the [EarnKeeper NestJs SDK](https://github.com/earnkeeper/ekp-sdk-nestjs).

## Build and run locally

Build the plugin with:

```
npm run build
```

Run the plugin locally with:

```
npm run start
```

⚠️ This app requires redis and mongodb, make sure you have redis running locally on port 6379 and mongodb running locally on port 27019.

## Deploying

The repository is already set up for deploy to kubernetes. 

From a fresh install, add a new file to the root of the project:

```
clear-values.yaml
```

(Copy clear-values.yaml.example to get a head start)

Configure this file with your secret settings.

Run the following to generate a secret key and encrypt your settings.

```
npm run gen-secret-key
npm run encrypt-secrets
```

Set the following two secrets on your github repo:

Secret Name|Description
---|---
WERF_SECRET_KEY|The contents of .werf_secret_key in the root of your project
KUBE_CONFIG_BASE64_DATA|The output of `doctl kubernetes cluster kubeconfig show <config name> | base64` if using digital ocean

Commit your changes and push to `main` branch. The github action in this repo will perform the deploy with werf.

## Splinterlands Api

Thank you to [kiokizz](https://github.com/kiokizz) for this excellent documentation:

https://github.com/kiokizz/Splinterlands-API

Copied here just in case he needs to take his down for any reason:

https://github.com/earnkeeper/Splinterlands-API
