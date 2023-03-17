# Knowledge Base App

## Deployment

- use `render.com` to deploy

#### Server

- connect git repo within render
- create `web service`
- select `root folder` as `server`
- add `environment` variables
  - `MONGO_URL=mongodb+srv://user:pwd@cluster.mongodb.net/test`
  - `PORT=5001`
- build command as `npm install`
- run command as `npm run start`

#### Client

- connect git repo within render
- create `static site`
- select `root folder` as `client`
- add `environment` variables
  - `REACT_APP_BASE_URL=https://<render generated url for server>`
- build command as `npm build`
- build folder as `build`
