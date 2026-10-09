# Pixel Perfect

Implement exactly the screenshot and nothing else

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/85299b6c-0a15-47b0-9098-dd65451a5ec2).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Deploying to Vercel

This is a static Vite + React single-page app. `vite build` writes the site to `dist/`, and
`vercel.json` rewrites every non-asset path to `index.html` so deep links such as `/app` are
handled by React Router in the browser. The Supabase client reads `VITE_SUPABASE_URL` and
`VITE_SUPABASE_PUBLISHABLE_KEY` at build time.
