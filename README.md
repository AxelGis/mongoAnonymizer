# Mongo Anonymizer

## Install
```
npm install
```

## Config
### Create file .env with variables:
```
DB_URI = "mongodb://localhost:27017"
```

## Run
### DEV-mode with Nodemon:
Starts generation of customers
```
npm run start:dev
```
Starts real-time sync
```
npm run sync:dev
```

### PROD-mode:
Starts generation of customers:
```
npm start
```
Starts real-time sync:
```
npm run sync
```
Starts full reindex (runs script with flag **--full-reindex**):
```
npm run sync:full
```

