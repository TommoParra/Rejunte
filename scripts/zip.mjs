/**
 * Builds rejunte.zip: the installable theme, without development files.
 * Everything listed in .distignore stays out. Run with `npm run zip`.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, rmSync } from 'node:fs'
import { basename, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const theme = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const name = basename(theme)
const ignored = readFileSync(resolve(theme, '.distignore'), 'utf8')
  .split('\n')
  .map(line => line.trim())
  .filter(line => line && ! line.startsWith('#'))

rmSync(resolve(theme, 'rejunte.zip'), { force: true })
const exclude = ignored.flatMap(entry => [ '-x', `${ name }/${ entry }`, '-x', `${ name }/${ entry }/*`, '-x', `*/${ entry }` ])
execFileSync('zip', [ '-rq', resolve(theme, 'rejunte.zip'), name, ...exclude ], { cwd: dirname(theme), stdio: 'inherit' })
console.log('rejunte.zip ready')
