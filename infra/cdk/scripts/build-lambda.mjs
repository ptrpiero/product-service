import * as esbuild from 'esbuild';
import { esbuildDecorators } from '@anatine/esbuild-decorators';
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import * as path from 'path';

const [,, entryPoint, outfile, tsconfig] = process.argv;
const outputDir = path.dirname(outfile);

// Isolate outputDir from any parent package.json so npm install
// doesn't traverse up to the monorepo root and trigger workspace scripts.
writeFileSync(path.join(outputDir, 'package.json'), JSON.stringify({ private: true }));

await esbuild.build({
  entryPoints: [entryPoint],
  bundle: true,
  minify: true,
  platform: 'node',
  target: 'node22',
  outfile,
  plugins: [esbuildDecorators({ tsconfig })],
  // NestJS lazy-loads optional modules via dynamic require(); mark them external
  // so esbuild skips resolution. None of these code paths execute in our app.
  // mysql2 is also external: Sequelize loads it via dynamic require(dialectVar),
  // which esbuild cannot statically analyze. It is installed separately below.
  external: [
    '@nestjs/microservices',
    '@nestjs/microservices/microservices-module',
    '@nestjs/websockets/socket-module',
    '@fastify/view',
    'class-transformer/storage',
    'pg-hstore',
    'mysql2',
  ],
});

// Install mysql2 alongside the bundle so Sequelize's dynamic require() finds it.
execSync('npm install --save-exact mysql2', { cwd: outputDir, stdio: 'inherit' });

console.log('Lambda bundle built:', outfile);
