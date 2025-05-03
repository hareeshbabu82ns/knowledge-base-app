### init project

```sh
pnpm create next-app@latest kbase --typescript --tailwind --eslint

git config --local commit.gpgsign false
git config --local user.email hareeshbabu82ns@gmail.com
```

```sh
pnpm dlx shadcn-ui@latest init
pnpm dlx shadcn-ui@latest add -a
```

```sh
npm i prisma -D

npm i next-auth @auth/core @prisma/client @auth/prisma-adapter
npm i @t3-oss/env-nextjs
npm i zod react-hook-form resend zustand
```

- Add Environment Variables to your `.env` can use `.env.sample` for ref
- google auth https://console.cloud.google.com/apis/credentials
- github auth https://github.com/settings/apps

- optional, if running local db

```sh
docker compose up -d
```

```sh
npm run db:gen # generates prisma client
npm run db:migrate # not valid for mongodb
npm run db:studio # opens db explorer

npm run dev:emails # email template designer

npm run dev
```

- Config Ref: https://github.com/Blazity/next-enterprise
- UI Ref
  - [shadcn-nextjs-boilerplate](https://github.com/horizon-ui/shadcn-nextjs-boilerplate)
  - [flowbite](https://flowbite.com/docs/components/pagination/)
  - [React Icons](https://react-icons.github.io/react-icons/search/#q=)

## Icon Generation

![Settings](/public/assets/icon-kitchen-settings.png)

- tool: https://icon.kitchen
- source image: `/public/assets/KBase App Icon.png`
- Settings:
  - Icons Set: Web Icons
  - Scaling: Crop
  - Mask: False
  - Padding: 2%
  - Bg Type: Color
  - Bg Color: #070F31
  - fav icon: Squircle

### commit with tags

```sh
git add .
git commit -m "update instructions"
git push origin main

# push single tag
git tag -a v1.0.0 -m "tag instructions"
git push origin v1.0.0

# push multiple tags
git tag -a v1.0.0 -m "tag instructions"
git tag -a v1 -m "tag instructions"
git push origin --tags

pnpm run release:patch # pushes to origin and tags together
```
