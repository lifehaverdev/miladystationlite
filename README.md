# MiladyStation

SELECT START

MiladyStation is a PlayStation 1 BIOS-themed app shell that serves as the hub for the Mony Group ecosystem. It hosts onchain applications as embedded "discs" and connects users to their holdings across the ecosystem's token and NFT collections.

**Live at [miladystation.net](https://miladystation.net)**

## Features

### Memory Card
Connect your wallet to view holdings across the ecosystem — ERC-721, ERC-1155, ERC-404, and ERC-20 collections displayed in a unified gallery. Enforces Ethereum mainnet.

### CD Player
Navigate the ecosystem through a disc menu. Subdomain applications (Power Packs Onchained, MiladyStation Classic, and more) run as embedded discs with an eject overlay. External projects and links are organized into subfolders.

### Boot Sequence
Faithful recreation of the PSone startup sequence with audio, serving as the entry point into the BIOS navigation.

## Stack

- [Microact](https://github.com/monygroupcorp/microact) — lightweight component framework
- [micro-web3](https://github.com/monygroupcorp/micro-web3) — wallet connectivity, IPFS utilities
- [ethers v5](https://docs.ethers.org/v5/) — onchain reads
- [Vite](https://vitejs.dev/) — build tooling
- GitHub Actions — CI/CD to GitHub Pages

## Development

```
npm install
npm run dev
```

Runs on `localhost:3000`.

## Build

```
npm run build
```

Output goes to `dist/`. Deployed automatically on push to `main` via GitHub Actions.

## Mony Group Corp

MiladyStation is developed by [Mony Group Corp](https://monygroup.net).
