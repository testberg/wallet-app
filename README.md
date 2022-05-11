# wallet-app

Tatum Wallet using Nextjs, Next-Auth, Prisma and Material UI

## Getting Started

### 1. Clone the repository and install dependencies

```
git clone https://github.com/testberg/wallet-app.git
cd wallet-app
npm install
```

### 2. Configure your local environment

Copy the .env.local.example file in this directory to .env.local (which will be ignored by Git):

```
cp .env.local.example .env.local
```

Add details for Google identity provider

```
GOOGLE_ID=******
GOOGLE_SECRET=******
```

And 
```
TATUM_API_KEY=****
```

### 4. Run Prisma DB Migration

```
npx prisma migrate dev --name init
```

### 5. Start the application

To run your site locally, use:

```
npm run dev
```

#### Possible Error when running on localhost

```
https://github.com/nextauthjs/next-auth/issues/212
```