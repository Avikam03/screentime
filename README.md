This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Running the Chrome Extension Locally

1. `yarn build`
2. `mv ./out/_next ./out/next && cd ./out && grep -rli '_next' * | xargs -I@ sed -i '' 's|/_next|/next|g' @ && cd ..`
