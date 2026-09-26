// Thin wrappers over the git CLI operating on the wiki working repository.
// Every mutating call is expected to run inside the global serial queue.
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { config } from './config.mjs'

const exec = promisify(execFile)

const gitEnv = {
  ...process.env,
  GIT_SSH_COMMAND: 'ssh -i /secrets/deploy_key -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new '
    + '-o UserKnownHostsFile=/secrets/known_hosts -o ConnectTimeout=15',
  GIT_TERMINAL_PROMPT: '0',
}

export async function git(args, { timeoutMs = 60_000 } = {}) {
  const { stdout } = await exec('git', ['-C', config.repoDir, ...args], {
    env: gitEnv, timeout: timeoutMs, maxBuffer: 16 * 1024 * 1024,
  })
  return stdout.trim()
}

export const headSha = () => git(['rev-parse', 'HEAD'])

export async function commitPaths(paths, { authorName, authorEmail, message }) {
  await git(['add', '--', ...paths])
  const staged = await git(['diff', '--cached', '--name-only'])
  if (!staged) return null
  await git([
    '-c', `user.name=${config.committerName}`, '-c', `user.email=${config.committerEmail}`,
    'commit', '--quiet', `--author=${authorName} <${authorEmail}>`, '-m', message,
  ])
  return headSha()
}

export async function isAncestor(a, b) {
  try {
    await git(['merge-base', '--is-ancestor', a, b])
    return true
  } catch {
    return false
  }
}

// Fetch upstream, integrate it (fast-forward or rebase), push local commits.
// Returns { changed, state, message, ahead }.
export async function syncWithRemote() {
  const remoteRef = `refs/remotes/origin/${config.branch}`
  try {
    await git(['remote', 'set-url', 'origin', config.gitUrl])
    await git(['fetch', '--quiet', 'origin', `+refs/heads/${config.branch}:${remoteRef}`], { timeoutMs: 45_000 })
  } catch (err) {
    return { changed: false, state: 'offline', message: `fetch failed: ${firstLine(err)}` }
  }

  const before = await headSha()
  const remote = await git(['rev-parse', remoteRef])
  if (!(await isAncestor(remote, before))) {
    if (await isAncestor(before, remote)) {
      await git(['merge', '--ff-only', '--quiet', remoteRef])
    } else {
      try {
        await git(['-c', `user.name=${config.committerName}`, '-c', `user.email=${config.committerEmail}`,
          'rebase', '--quiet', remoteRef])
      } catch (err) {
        const files = await git(['diff', '--name-only', '--diff-filter=U']).catch(() => '')
        await git(['rebase', '--abort']).catch(() => {})
        return { changed: false, state: 'conflict', message: `rebase conflict: ${files.replace(/\n/g, ', ') || firstLine(err)}` }
      }
    }
  }
  const after = await headSha()
  const ahead = Number(await git(['rev-list', '--count', `${remoteRef}..HEAD`]))
  if (ahead > 0) {
    try {
      await git(['push', '--quiet', 'origin', `HEAD:refs/heads/${config.branch}`], { timeoutMs: 60_000 })
    } catch (err) {
      return { changed: after !== before, state: 'push_failed', message: `push failed: ${firstLine(err)}`, ahead }
    }
  }
  return { changed: after !== before, state: 'ok', message: ahead ? `pushed ${ahead} commit(s)` : 'up to date', ahead: 0 }
}

function firstLine(err) {
  return String(err?.stderr || err?.message || err).trim().split('\n').pop()
}
