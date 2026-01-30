# SC Market Frontend

This repository hosts the frontend for [SC Market](https://sc-market.space).

## API (RTK Query)

**The generated API should be preferred for new code.** API slices and types are generated from the OpenAPI spec; see [src/store/api/README.md](src/store/api/README.md) for usage, regeneration, and config.

## Local Development

Please read through the guide for setting up the [backend](https://github.com/SC-Market/sc-market-backend/blob/main/README.md)
and ensure the variables in [.env](.env) match those in your backend's .env file.

## Android Build

Android TWA (Trusted Web Activity) build tooling has been moved to a separate repository: [sc-market-android](../sc-market-android/). See that repository for Android app build instructions.

### Local Development Server

This project uses npm to manage dependencies. You can install dependencies using the `npm` command.

```shell
npm install
```

Running the project is simple and can be done with

```shell
npm run dev
```

You can ensure your changes build with

```shell
npm run build && npm run check
```
