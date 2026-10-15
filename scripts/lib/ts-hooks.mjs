// Module resolution hooks so tests can import the app's TypeScript directly
// with Node's built-in type stripping (Node >= 22.18 / 24): resolves the "@/"
// path alias and extensionless relative imports to .ts files.
// Registered by scripts/lib/register-ts.mjs.
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function tryFile(base) {
  for (const ext of ['', '.ts', '.tsx', '/index.ts']) {
    const p = base + ext;
    if (existsSync(p) && statSync(p).isFile()) return p;
  }
  return null;
}

export async function resolve(specifier, context, next) {
  if (specifier.startsWith('@/')) {
    const f = tryFile(path.join(ROOT, specifier.slice(2)));
    if (f) return { url: pathToFileURL(f).href, shortCircuit: true };
  }
  if ((specifier.startsWith('./') || specifier.startsWith('../')) && context.parentURL?.startsWith('file:')) {
    const parentDir = path.dirname(fileURLToPath(context.parentURL));
    if (!/\.[cm]?[jt]sx?$/.test(specifier) && parentDir.startsWith(ROOT) && !parentDir.includes('node_modules')) {
      const f = tryFile(path.resolve(parentDir, specifier));
      if (f) return { url: pathToFileURL(f).href, shortCircuit: true };
    }
  }
  try {
    return await next(specifier, context);
  } catch (e) {
    // Packages without an "exports" map (e.g. next/server) need the .js extension under ESM.
    if (e?.code === 'ERR_MODULE_NOT_FOUND' && /^[a-z@][^:]*\/[^.]+$/i.test(specifier)) return next(`${specifier}.js`, context);
    throw e;
  }
}

// Transpile the app's .ts files with the project's own TypeScript (elides
// type-only imports, which plain type stripping cannot do).
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const ts = createRequire(import.meta.url)('typescript');

export async function load(url, context, next) {
  if (url.startsWith('file:') && /\.tsx?$/.test(url)) {
    const file = fileURLToPath(url);
    if (file.startsWith(ROOT) && !file.includes('node_modules')) {
      const out = ts.transpileModule(readFileSync(file, 'utf8'), {
        fileName: file,
        compilerOptions: {
          module: ts.ModuleKind.ESNext,
          target: ts.ScriptTarget.ES2022,
          esModuleInterop: true,
          jsx: ts.JsxEmit.ReactJSX,
          sourceMap: false,
        },
      });
      return { format: 'module', source: out.outputText, shortCircuit: true };
    }
  }
  return next(url, context);
}
