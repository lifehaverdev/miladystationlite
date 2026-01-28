import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  return {
    base: '/',
    server: {
      port: 3000,
    },
    optimizeDeps: {
      include: [
        'ethers',
        '@ethersproject/providers',
        '@ethersproject/abi',
        '@ethersproject/bignumber',
        'bn.js',
        'js-sha3'
      ],
    },
    build: {
      commonjsOptions: {
        include: [/node_modules/],
      },
    },
    define: {
      global: 'globalThis',
    },
  }
})
