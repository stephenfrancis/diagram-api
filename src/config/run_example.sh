npx parcel build src/examples/$1.ts -d build/examples --cache-dir build/cache --target node --out-file $1.js
node build/examples/$1.js
