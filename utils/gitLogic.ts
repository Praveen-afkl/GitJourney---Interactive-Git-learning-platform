import { GitState, Commit, Branch, Lesson, Tag } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const INITIAL_STATE: GitState = {
  commits: [
    {
      id: 'init',
      message: 'Initial commit',
      parentId: null,
      secondParentId: null,
      timestamp: Date.now(),
      author: 'User',
    },
  ],
  branches: [{ name: 'main', commitId: 'init' }],
  tags: [],
  head: { type: 'branch', ref: 'main' },
};

const generateShortId = () => uuidv4().substring(0, 7);

export const getHeadCommitId = (state: GitState): string => {
  if (state.head.type === 'commit') {
    return state.head.ref;
  }
  const branch = state.branches.find((b) => b.name === state.head.ref);
  return branch ? branch.commitId : 'init';
};

// Helper to find commit by ID or Ref (Branch/Tag)
const resolveRef = (state: GitState, ref: string): string | null => {
    if (!ref) return null;
    // 1. Try Branch
    const branch = state.branches.find(b => b.name === ref);
    if (branch) return branch.commitId;
    
    // 2. Try Tag
    const tag = state.tags.find(t => t.name === ref);
    if (tag) return tag.commitId;

    // 3. Try Commit ID (exact or prefix)
    const commit = state.commits.find(c => c.id === ref || c.id.startsWith(ref));
    if (commit) return commit.id;

    // 4. Handle HEAD
    if (ref === 'HEAD') return getHeadCommitId(state);

    return null;
};

const getNextTimestamp = (state: GitState) => {
    const lastTime = state.commits.length > 0 
        ? Math.max(...state.commits.map(c => c.timestamp)) 
        : 0;
    return Math.max(Date.now(), lastTime + 2000);
};

// Check if commit A is an ancestor of commit B
const isAncestor = (state: GitState, ancestorId: string, descendantId: string): boolean => {
    if (ancestorId === descendantId) return true;
    
    const queue = [descendantId];
    const visited = new Set<string>();
    
    while (queue.length > 0) {
        const curr = queue.shift()!;
        if (visited.has(curr)) continue;
        visited.add(curr);
        
        if (curr === ancestorId) return true;
        
        const commit = state.commits.find(c => c.id === curr);
        if (commit) {
            if (commit.parentId) queue.push(commit.parentId);
            if (commit.secondParentId) queue.push(commit.secondParentId);
        }
    }
    return false;
};

// --- Command Execution Engine ---

export const executeGitCommand = (
  command: string,
  state: GitState
): { newState: GitState; output: string; success: boolean } => {
  const parts = command.trim().split(/\s+/);
  const cmd = parts[0];
  const subCmd = parts[1];

  if (cmd !== 'git') {
    return { newState: state, output: "Command must start with 'git'", success: false };
  }

  // --- NEW: INIT ---
  if (subCmd === 'init') {
      return {
          newState: INITIAL_STATE,
          output: `Initialized empty Git repository in /project/.git/`,
          success: true
      }
  }

  // --- NEW: REMOTE ---
  if (subCmd === 'remote') {
      if (parts[2] === 'add') {
          const name = parts[3];
          const url = parts[4];
          if (!name || !url) return { newState: state, output: 'usage: git remote add <name> <url>', success: false };
          
          // In this simulator, we treat 'remote add' as a success signal for the lesson
          // Real git would update .git/config
          return { 
              newState: state, 
              output: `Added remote '${name}' as '${url}'`, 
              success: true 
          };
      }
      if (parts[2] === '-v' || parts[2] === 'get-url') {
          return {
              newState: state,
              output: `origin  https://github.com/user/repo.git (fetch)\norigin  https://github.com/user/repo.git (push)`,
              success: true
          }
      }
      return { newState: state, output: '', success: true };
  }

  // --- NEW: LOG ---
  if (subCmd === 'log') {
      const logOutput = state.commits
          .sort((a, b) => b.timestamp - a.timestamp)
          .map(c => {
              const date = new Date(c.timestamp).toLocaleTimeString();
              return `commit ${c.id}\nAuthor: ${c.author}\nDate: ${date}\n\n    ${c.message}`;
          })
          .join('\n\n');
      return { newState: state, output: logOutput || '(no commits)', success: true };
  }

  // --- NEW: ADD ---
  if (subCmd === 'add') {
      return { newState: state, output: '', success: true }; // No-op visual, just success
  }

  // --- NEW: CLONE ---
  if (subCmd === 'clone') {
      // Simulate downloading a repo
      const clonedState: GitState = {
          commits: [
              { id: 'c82a', message: 'Initial public release', parentId: null, secondParentId: null, timestamp: Date.now() - 10000, author: 'Origin' },
              { id: 'a12b', message: 'Update README', parentId: 'c82a', secondParentId: null, timestamp: Date.now() - 5000, author: 'Origin' }
          ],
          branches: [
              { name: 'main', commitId: 'a12b' },
              { name: 'origin/main', commitId: 'a12b' }
          ],
          tags: [],
          head: { type: 'branch', ref: 'main' }
      };
      return { 
          newState: clonedState, 
          output: `Cloning into 'project'...\nRemote: Enumerating objects: 5, done.\nRemote: Total 5 (delta 0), reused 0 (delta 0)\nUnpacking objects: 100% (5/5), done.`, 
          success: true 
      };
  }

  // --- NEW: FETCH ---
  if (subCmd === 'fetch') {
      // Simulate new work appearing on remote
      const originBranch = state.branches.find(b => b.name === 'origin/main');
      if (!originBranch) return { newState: state, output: 'No remote found', success: false };

      const newCommitId = generateShortId();
      const newCommit: Commit = {
          id: newCommitId,
          message: 'Remote update',
          parentId: originBranch.commitId,
          secondParentId: null,
          timestamp: getNextTimestamp(state),
          author: 'Teammate'
      };

      const newBranches = state.branches.map(b => 
          b.name === 'origin/main' ? { ...b, commitId: newCommitId } : b
      );

      return {
          newState: {
              ...state,
              commits: [...state.commits, newCommit],
              branches: newBranches
          },
          output: `From https://github.com/demo/repo\n   ${originBranch.commitId.substring(0,4)}..${newCommitId.substring(0,4)}  main       -> origin/main`,
          success: true
      };
  }

  // --- NEW: PULL ---
  if (subCmd === 'pull') {
      // 1. Run Fetch Logic
      const fetchRes = executeGitCommand('git fetch', state);
      if (!fetchRes.success) return fetchRes;

      // 2. Run Merge Logic
      const mergeRes = executeGitCommand('git merge origin/main', fetchRes.newState);
      
      return {
          newState: mergeRes.newState,
          output: `${fetchRes.output}\n${mergeRes.output}`,
          success: true
      };
  }

  // --- NEW: PUSH ---
  if (subCmd === 'push') {
      const currentBranch = state.head.ref;
      if (state.head.type !== 'branch') return { newState: state, output: 'fatal: You are not currently on a branch.', success: false };
      
      // Handle 'git push -u origin <branch>'
      if (parts.includes('-u') || parts.includes('--set-upstream')) {
          // Just treat it like a normal push for simulation purposes, but acknowledge it
      }

      const branch = state.branches.find(b => b.name === currentBranch);
      if (!branch) return { newState: state, output: 'error', success: false };

      const remoteName = `origin/${currentBranch}`;
      const remoteBranch = state.branches.find(b => b.name === remoteName);

      // Check for non-fast-forward
      if (remoteBranch) {
          const isFF = isAncestor(state, remoteBranch.commitId, branch.commitId);
          if (!isFF && remoteBranch.commitId !== branch.commitId) {
              return { 
                  newState: state, 
                  output: `! [rejected]        ${currentBranch} -> ${currentBranch} (non-fast-forward)\nhint: Updates were rejected because the tip of your current branch is behind\nhint: its remote counterpart. Integrate the remote changes (e.g.\nhint: 'git pull ...') before pushing again.`, 
                  success: false 
              };
          }
      }

      const newBranches = state.branches.filter(b => b.name !== remoteName);
      newBranches.push({ name: remoteName, commitId: branch.commitId });

      return {
          newState: { ...state, branches: newBranches },
          output: `Enumerating objects: 3, done.\nTo https://github.com/demo/repo.git\n   ${branch.commitId.substring(0,7)}..${branch.commitId.substring(0,7)}  ${currentBranch} -> ${currentBranch}`,
          success: true
      };
  }

  // --- 1. COMMIT ---
  if (subCmd === 'commit') {
    const fullCmd = parts.join(' ');
    const quoteStart = fullCmd.indexOf('"');
    const quoteEnd = fullCmd.lastIndexOf('"');
    
    // --amend logic
    if (parts.includes('--amend')) {
        const headId = getHeadCommitId(state);
        const oldCommit = state.commits.find(c => c.id === headId);
        if (!oldCommit) return { newState: state, output: 'Nothing to amend', success: false };

        let newMessage = oldCommit.message;
        if (parts.includes('-m') && quoteStart !== -1) {
             newMessage = fullCmd.substring(quoteStart + 1, quoteEnd);
        }

        const updatedCommits = state.commits.map(c => 
            c.id === headId ? { ...c, message: newMessage, timestamp: Date.now() } : c
        );

        return {
            newState: { ...state, commits: updatedCommits },
            output: `[detached HEAD] ${headId} ${newMessage}`,
            success: true
        }
    }

    let message = `Commit ${generateShortId()}`;
    if (quoteStart !== -1 && quoteEnd !== -1 && quoteEnd > quoteStart) {
        message = fullCmd.substring(quoteStart + 1, quoteEnd);
    } else {
         message = `Update ${generateShortId()}`;
    }

    const currentHeadId = getHeadCommitId(state);
    const newCommit: Commit = {
      id: generateShortId(),
      message,
      parentId: currentHeadId,
      secondParentId: null,
      timestamp: getNextTimestamp(state),
      author: 'User',
    };

    let newBranches = [...state.branches];
    
    if (state.head.type === 'branch') {
      newBranches = newBranches.map((b) =>
        b.name === state.head.ref ? { ...b, commitId: newCommit.id } : b
      );
    } else {
       return { 
           newState: {
            ...state,
            commits: [...state.commits, newCommit],
            head: { type: 'commit', ref: newCommit.id }
           },
           output: `[detached HEAD] ${newCommit.id} ${message}`,
           success: true 
       };
    }

    return {
      newState: {
        ...state,
        commits: [...state.commits, newCommit],
        branches: newBranches,
      },
      output: `[${state.head.ref}] ${newCommit.id} ${message}`,
      success: true,
    };
  }

  // --- 2. BRANCH ---
  if (subCmd === 'branch') {
    // git branch -M main (Rename)
    if (parts[2] === '-M') {
        const newName = parts[3];
        const currentRef = state.head.ref;
        if (state.head.type !== 'branch') return { newState: state, output: 'Must be on a branch to rename', success: false };
        
        const newBranches = state.branches.map(b => b.name === currentRef ? { ...b, name: newName } : b);
        return {
            newState: {
                ...state,
                branches: newBranches,
                head: { type: 'branch', ref: newName }
            },
            output: `Renamed branch to '${newName}'`,
            success: true
        };
    }

    const branchName = parts[2];
    if (!branchName) return { newState: state, output: 'Branch name required', success: false };
    if (state.branches.find((b) => b.name === branchName)) {
      return { newState: state, output: `fatal: A branch named '${branchName}' already exists.`, success: false };
    }

    const startPointRef = parts[3];
    let startCommitId = getHeadCommitId(state);
    if (startPointRef) {
        const resolved = resolveRef(state, startPointRef);
        if (!resolved) return { newState: state, output: `fatal: Not a valid object name: '${startPointRef}'.`, success: false };
        startCommitId = resolved;
    }

    return {
      newState: {
        ...state,
        branches: [...state.branches, { name: branchName, commitId: startCommitId }],
      },
      output: `Created branch '${branchName}'`,
      success: true,
    };
  }

  // --- 3. CHECKOUT / SWITCH ---
  if (subCmd === 'checkout' || subCmd === 'switch') {
    // git checkout -b <name>
    if (parts[2] === '-b' || parts[2] === '-c') {
      const branchName = parts[3];
      if (!branchName) return { newState: state, output: 'Branch name required', success: false };
      if (state.branches.find((b) => b.name === branchName)) {
        return { newState: state, output: `fatal: A branch named '${branchName}' already exists.`, success: false };
      }
      
      const currentHeadId = getHeadCommitId(state);
      const newBranch = { name: branchName, commitId: currentHeadId };
      
      return {
        newState: {
          ...state,
          branches: [...state.branches, newBranch],
          head: { type: 'branch', ref: branchName },
        },
        output: `Switched to a new branch '${branchName}'`,
        success: true,
      };
    } else {
      const target = parts[2];
      if (!target) return { newState: state, output: 'Target required', success: false };
      
      const branch = state.branches.find((b) => b.name === target);
      if (branch) {
        return {
          newState: { ...state, head: { type: 'branch', ref: branch.name } },
          output: `Switched to branch '${target}'`,
          success: true,
        };
      }
      
      const commitId = resolveRef(state, target);
      if (commitId) {
         return {
            newState: { ...state, head: { type: 'commit', ref: commitId } },
            output: `Note: switching to '${target}'. You are in 'detached HEAD' state.`,
            success: true
         };
      }

      return { newState: state, output: `error: pathspec '${target}' did not match any file(s) known to git`, success: false };
    }
  }

  // --- 4. MERGE ---
  if (subCmd === 'merge') {
    const sourceName = parts[2];
    if (!sourceName) return { newState: state, output: 'Merge source required', success: false };
    
    const sourceCommitId = resolveRef(state, sourceName);
    if (!sourceCommitId) return { newState: state, output: `Merge source '${sourceName}' not found`, success: false };

    if (state.head.type !== 'branch') {
         return { newState: state, output: `You must be on a branch to merge`, success: false };
    }

    const currentHeadId = getHeadCommitId(state);
    
    if (sourceCommitId === currentHeadId) {
        return { newState: state, output: `Already up to date.`, success: true };
    }

    // Check if this is a fast-forward merge (source is directly ahead of current)
    const isFastForward = isAncestor(state, currentHeadId, sourceCommitId);
    
    if (isFastForward) {
        // Fast-forward: just move the branch pointer forward
        const newBranches = state.branches.map(b => 
            b.name === state.head.ref ? { ...b, commitId: sourceCommitId } : b
        );

        return {
            newState: {
                ...state,
                branches: newBranches
            },
            output: `Fast-forward merge: ${state.head.ref} is now at ${sourceCommitId.substring(0, 7)}`,
            success: true
        };
    } else {
        // Three-way merge: create a merge commit
        const newCommit: Commit = {
            id: generateShortId(),
            message: `Merge ${sourceName} into ${state.head.ref}`,
            parentId: currentHeadId,
            secondParentId: sourceCommitId,
            timestamp: getNextTimestamp(state),
            author: 'User'
        };

        const newBranches = state.branches.map(b => 
            b.name === state.head.ref ? { ...b, commitId: newCommit.id } : b
        );

        return {
            newState: {
                ...state,
                commits: [...state.commits, newCommit],
                branches: newBranches
            },
            output: `Merged ${sourceName} into ${state.head.ref}`,
            success: true
        };
    }
  }

  // --- 5. RESET (Hard) ---
  if (subCmd === 'reset') {
      const mode = parts[2]; // --hard
      const targetRef = parts[3] || parts[2];

      let actualTarget = targetRef;
      if (mode !== '--hard' && parts.length === 3) {
          actualTarget = parts[2];
      }
      if (mode === '--hard') actualTarget = parts[3];

      if (state.head.type !== 'branch') {
           return { newState: state, output: 'Resetting in detached HEAD is just checkout.', success: false };
      }

      let targetId = resolveRef(state, actualTarget);
      
      if (!targetId && actualTarget.includes('~')) {
          const [base, countStr] = actualTarget.split('~');
          if (base === 'HEAD') {
              let curr = getHeadCommitId(state);
              let count = parseInt(countStr) || 1;
              while(count > 0 && curr) {
                  const c = state.commits.find(x => x.id === curr);
                  if (c && c.parentId) {
                      curr = c.parentId;
                      count--;
                  } else {
                      break;
                  }
              }
              if (count === 0) targetId = curr;
          }
      }

      if (!targetId) return { newState: state, output: `Could not resolve ${actualTarget}`, success: false };

      const newBranches = state.branches.map(b => 
          b.name === state.head.ref ? { ...b, commitId: targetId! } : b
      );

      return {
          newState: { ...state, branches: newBranches },
          output: `HEAD is now at ${targetId.substring(0,7)}`,
          success: true
      }
  }

  // --- 6. REVERT ---
  if (subCmd === 'revert') {
      const targetRef = parts[2];
      const targetId = resolveRef(state, targetRef);
      if (!targetId) return { newState: state, output: `Bad revision '${targetRef}'`, success: false };

      const currentHeadId = getHeadCommitId(state);
      const targetCommit = state.commits.find(c => c.id === targetId);

      const newCommit: Commit = {
          id: generateShortId(),
          message: `Revert "${targetCommit?.message}"`,
          parentId: currentHeadId,
          secondParentId: null,
          timestamp: getNextTimestamp(state),
          author: 'User'
      };

      let newBranches = [...state.branches];
      if (state.head.type === 'branch') {
        newBranches = newBranches.map((b) =>
          b.name === state.head.ref ? { ...b, commitId: newCommit.id } : b
        );
      }

      return {
          newState: {
              ...state,
              commits: [...state.commits, newCommit],
              branches: newBranches
          },
          output: `[${state.head.ref}] ${newCommit.id} Revert "${targetCommit?.message}"`,
          success: true
      }
  }

  // --- 7. CHERRY-PICK ---
  if (subCmd === 'cherry-pick') {
      const targetRef = parts[2];
      const targetId = resolveRef(state, targetRef);
      if (!targetId) return { newState: state, output: `Bad revision`, success: false };
      
      const sourceCommit = state.commits.find(c => c.id === targetId);
      if (!sourceCommit) return { newState: state, output: `Commit not found`, success: false };

      const currentHeadId = getHeadCommitId(state);
      const newCommit: Commit = {
          id: generateShortId(),
          message: sourceCommit.message,
          parentId: currentHeadId,
          secondParentId: null,
          timestamp: getNextTimestamp(state),
          author: 'User'
      };

      let newBranches = [...state.branches];
      if (state.head.type === 'branch') {
          newBranches = newBranches.map(b => 
              b.name === state.head.ref ? { ...b, commitId: newCommit.id } : b
          );
      }

      return {
          newState: {
              ...state,
              commits: [...state.commits, newCommit],
              branches: newBranches
          },
          output: `[${state.head.ref}] ${newCommit.id} ${newCommit.message}`,
          success: true
      };
  }

  // --- 8. TAG ---
  if (subCmd === 'tag') {
      const tagName = parts[2];
      if (!tagName) return { newState: state, output: 'Tag name required', success: false };
      
      const currentHeadId = getHeadCommitId(state);
      return {
          newState: {
              ...state,
              tags: [...state.tags, { name: tagName, commitId: currentHeadId }]
          },
          output: `Created tag ${tagName}`,
          success: true
      };
  }

  // --- 9. REBASE ---
  if (subCmd === 'rebase') {
      const baseRef = parts[2];
      const baseId = resolveRef(state, baseRef);
      if (!baseId) return { newState: state, output: `Invalid base`, success: false };
      
      if (state.head.type !== 'branch') return { newState: state, output: `Must be on branch`, success: false };
      const currentBranchName = state.head.ref;
      const currentTipId = getHeadCommitId(state);

      // Simple linearity check
      const getLineage = (start: string): Set<string> => {
          const s = new Set<string>();
          let curr: string | null | undefined = start;
          while(curr) {
              s.add(curr);
              const c = state.commits.find(x => x.id === curr);
              curr = c?.parentId;
          }
          return s;
      };

      const baseLineage = getLineage(baseId);
      const commitsToMove: Commit[] = [];
      let pointer: string | null | undefined = currentTipId;
      while(pointer && !baseLineage.has(pointer)) {
          const c = state.commits.find(x => x.id === pointer);
          if (c) commitsToMove.push(c);
          pointer = c?.parentId;
      }
      commitsToMove.reverse();

      if (commitsToMove.length === 0) {
          return { newState: state, output: `Already up to date.`, success: true };
      }

      let newParentId = baseId;
      const newCommits: Commit[] = [];

      for (const c of commitsToMove) {
          const copy: Commit = {
              id: generateShortId(),
              message: c.message,
              parentId: newParentId,
              secondParentId: null,
              timestamp: getNextTimestamp(state) + newCommits.length,
              author: c.author
          };
          newCommits.push(copy);
          newParentId = copy.id;
      }

      const newBranches = state.branches.map(b => 
          b.name === currentBranchName ? { ...b, commitId: newParentId } : b
      );

      return {
          newState: {
              ...state,
              commits: [...state.commits, ...newCommits],
              branches: newBranches
          },
          output: `Rebased refs/heads/${currentBranchName}`,
          success: true
      };
  }

  return { newState: state, output: `git: '${subCmd}' is not a git command.`, success: false };
};

export const PRACTICE_LESSON: Lesson = {
  id: 'practice',
  section: 'Playground',
  title: 'Git Sandbox',
  description: 'A safe environment to experiment with any Git command.',
  task: 'Experiment freely',
  hint: 'Try git commit, git branch, git log',
  initialState: INITIAL_STATE,
  checkSuccess: () => false
};

// 23 Lessons for 0 to 100
export const LESSONS: Lesson[] = [
  // --- FOUNDATIONS ---
  {
    id: '1_init',
    section: 'The Starting Point',
    title: '1. Initialize Repo',
    description: 'Every Git journey starts here. `git init` creates a new repository.',
    task: 'Run git init',
    hint: 'git init',
    initialState: { commits: [], branches: [], tags: [], head: { type: 'branch', ref: 'main' } },
    checkSuccess: (state) => true
  },
  {
    id: '2_add',
    section: 'The Starting Point',
    title: '2. Staging Changes',
    description: 'Git has a staging area. `git add .` moves changes there before committing.',
    task: 'Stage all changes',
    hint: 'git add .',
    initialState: INITIAL_STATE,
    checkSuccess: (state) => true
  },
  {
    id: '3_commit',
    section: 'The Starting Point',
    title: '3. First Commit',
    description: 'Save your work permanently with `git commit`.',
    task: 'Commit with message "First"',
    hint: 'git commit -m "First"',
    initialState: INITIAL_STATE,
    checkSuccess: (state) => state.commits.length > 1
  },
  {
    id: '4_amend',
    section: 'The Starting Point',
    title: '4. Fixing Mistakes',
    description: 'Made a typo in your commit message? `git commit --amend` lets you fix the most recent commit.',
    task: 'Amend the last commit message to "Corrected"',
    hint: 'git commit --amend -m "Corrected"',
    initialState: {
        commits: [{ id: 'c1', message: 'Typo!', parentId: null, secondParentId: null, timestamp: Date.now(), author: 'User' }],
        branches: [{ name: 'main', commitId: 'c1' }],
        tags: [],
        head: { type: 'branch', ref: 'main' }
    },
    checkSuccess: (state) => {
        const c = state.commits.find(x => x.id === state.branches[0].commitId);
        return c?.message === 'Corrected';
    }
  },
  {
    id: '5_log',
    section: 'The Starting Point',
    title: '5. Viewing History',
    description: 'See where you have been with `git log`.',
    task: 'Run git log',
    hint: 'git log',
    initialState: {
        commits: [{ id: 'a', message: 'Start', parentId: null, secondParentId: null, timestamp: Date.now(), author: 'User' }],
        branches: [{ name: 'main', commitId: 'a' }],
        tags: [],
        head: { type: 'branch', ref: 'main' }
    },
    checkSuccess: (state) => true
  },

  // --- BRANCHING ---
  {
    id: '6_branch',
    section: 'Branching Out',
    title: '6. Creating Branches',
    description: 'Branches isolate your work. Create a "feature" branch.',
    task: 'Create branch "feature"',
    hint: 'git branch feature',
    initialState: INITIAL_STATE,
    checkSuccess: (state) => state.branches.some(b => b.name === 'feature')
  },
  {
    id: '7_checkout',
    section: 'Branching Out',
    title: '7. Switching Context',
    description: 'Use `git checkout` to switch between branches. Switch to the "feature" branch you just created.',
    task: 'Checkout "feature"',
    hint: 'git checkout feature',
    initialState: {
        commits: [{ id: 'init', message: 'Init', parentId: null, secondParentId: null, timestamp: Date.now(), author: 'User' }],
        branches: [{ name: 'main', commitId: 'init' }, { name: 'feature', commitId: 'init' }],
        tags: [],
        head: { type: 'branch', ref: 'main' }
    },
    checkSuccess: (state) => state.head.ref === 'feature'
  },
  {
    id: '8_ff_merge',
    section: 'Branching Out',
    title: '8. Fast-Forward Merge',
    description: 'Merge a branch that is directly ahead of current history. It simply moves the pointer.',
    task: 'Merge "feature" into "main"',
    hint: 'git checkout main && git merge feature',
    initialState: {
        commits: [
            { id: '1', message: 'Start', parentId: null, secondParentId: null, timestamp: 1000, author: 'User' },
            { id: '2', message: 'Feature Work', parentId: '1', secondParentId: null, timestamp: 2000, author: 'User' }
        ],
        branches: [
            { name: 'main', commitId: '1' },
            { name: 'feature', commitId: '2' }
        ],
        tags: [],
        head: { type: 'branch', ref: 'main' }
    },
    checkSuccess: (state) => {
        const m = state.branches.find(b => b.name === 'main');
        const f = state.branches.find(b => b.name === 'feature');
        return m?.commitId === f?.commitId;
    }
  },
  {
    id: '9_merge',
    section: 'Branching Out',
    title: '9. Three-Way Merge',
    description: 'Merge branches that have diverged. This creates a dedicated Merge Commit.',
    task: 'Merge "feature" into "main"',
    hint: 'git merge feature',
    initialState: {
        commits: [
            { id: 'root', message: 'Root', parentId: null, secondParentId: null, timestamp: 1000, author: 'User' },
            { id: 'm1', message: 'Main Fix', parentId: 'root', secondParentId: null, timestamp: 2000, author: 'User' },
            { id: 'f1', message: 'New Feature', parentId: 'root', secondParentId: null, timestamp: 3000, author: 'User' }
        ],
        branches: [
            { name: 'main', commitId: 'm1' },
            { name: 'feature', commitId: 'f1' }
        ],
        tags: [],
        head: { type: 'branch', ref: 'main' }
    },
    checkSuccess: (state) => state.commits.some(c => c.secondParentId !== null)
  },
  {
    id: '10_tag',
    section: 'Branching Out',
    title: '10. Tagging',
    description: 'Tags correspond to specific points in time. Create a "v1.0" tag.',
    task: 'Run git tag v1.0',
    hint: 'git tag v1.0',
    initialState: INITIAL_STATE,
    checkSuccess: (state) => state.tags.length > 0
  },
  {
    id: '11_detached',
    section: 'Branching Out',
    title: '11. Detached HEAD',
    description: 'You can checkout any commit hash directly. This enters "Detached HEAD" mode.',
    task: 'Checkout the "root" commit',
    hint: 'git checkout root',
    initialState: {
        commits: [
            { id: 'root', message: 'Root', parentId: null, secondParentId: null, timestamp: 1000, author: 'User' },
            { id: 'curr', message: 'Current', parentId: 'root', secondParentId: null, timestamp: 2000, author: 'User' }
        ],
        branches: [{ name: 'main', commitId: 'curr' }],
        tags: [],
        head: { type: 'branch', ref: 'main' }
    },
    checkSuccess: (state) => state.head.type === 'commit' && state.head.ref === 'root'
  },

  // --- GITHUB MASTERY ---
  {
    id: '12_remote',
    section: 'GitHub Mastery',
    title: '12. Connecting Remotes',
    description: 'To link your local repo to GitHub, you add a remote. The standard name is "origin".',
    task: 'Add a remote named origin',
    hint: 'git remote add origin https://github.com/user/repo.git',
    initialState: INITIAL_STATE,
    checkSuccess: (state) => true // Successful execution of command is enough
  },
  {
    id: '13_clone',
    section: 'GitHub Mastery',
    title: '13. Cloning',
    description: 'Download a remote repository to your local machine. This automatically sets up the "origin" remote.',
    task: 'Clone the repo',
    hint: 'git clone https://github.com/demo/repo',
    initialState: { commits: [], branches: [], tags: [], head: { type: 'branch', ref: 'main' } },
    checkSuccess: (state) => state.commits.length > 0
  },
  {
    id: '14_push',
    section: 'GitHub Mastery',
    title: '14. Pushing',
    description: 'Upload your local branch commits to the remote repository.',
    task: 'Push main to origin',
    hint: 'git push',
    initialState: {
        commits: [
            { id: '1', message: 'Shared', parentId: null, secondParentId: null, timestamp: 1000, author: 'Origin' },
            { id: '2', message: 'My Work', parentId: '1', secondParentId: null, timestamp: 2000, author: 'User' }
        ],
        branches: [
            { name: 'main', commitId: '2' },
            { name: 'origin/main', commitId: '1' }
        ],
        tags: [],
        head: { type: 'branch', ref: 'main' }
    },
    checkSuccess: (state) => {
        const local = state.branches.find(b => b.name === 'main');
        const remote = state.branches.find(b => b.name === 'origin/main');
        return local?.commitId === remote?.commitId;
    }
  },
  {
    id: '15_fetch',
    section: 'GitHub Mastery',
    title: '15. Fetching',
    description: '`git fetch` downloads new data from the remote project but doesn\'t integrate it into your working files yet.',
    task: 'Fetch changes from origin',
    hint: 'git fetch',
    initialState: {
        commits: [{ id: '1', message: 'Init', parentId: null, secondParentId: null, timestamp: 1000, author: 'Origin' }],
        branches: [
            { name: 'main', commitId: '1' },
            { name: 'origin/main', commitId: '1' }
        ],
        tags: [],
        head: { type: 'branch', ref: 'main' }
    },
    checkSuccess: (state) => {
        const local = state.branches.find(b => b.name === 'main');
        const remote = state.branches.find(b => b.name === 'origin/main');
        return local?.commitId !== remote?.commitId;
    }
  },
  {
    id: '16_pull',
    section: 'GitHub Mastery',
    title: '16. Pulling',
    description: '`git pull` is a combination of `git fetch` and `git merge`. It updates your current branch.',
    task: 'Pull changes from origin',
    hint: 'git pull',
    initialState: {
        commits: [{ id: '1', message: 'Init', parentId: null, secondParentId: null, timestamp: 1000, author: 'Origin' }],
        branches: [
            { name: 'main', commitId: '1' },
            { name: 'origin/main', commitId: '1' }
        ],
        tags: [],
        head: { type: 'branch', ref: 'main' }
    },
    checkSuccess: (state) => state.commits.length > 1 && state.commits.some(c => c.message === 'Remote update')
  },

  // --- REAL WORLD WORKFLOWS (VS CODE / PROJECT MANAGEMENT) ---
  {
    id: '20_publish',
    section: 'Real World Workflows',
    title: '20. VS Code: Publish Branch',
    description: 'In VS Code, the "Publish Branch" button does two things: it adds a remote (if missing) and pushes your local branch upstream. \n\nLet\'s simulate publishing a local project to GitHub for the first time.',
    task: 'Add remote "origin" AND push main',
    hint: 'git remote add origin https://... && git push -u origin main',
    initialState: {
        commits: [{ id: 'init', message: 'Project Start', parentId: null, secondParentId: null, timestamp: Date.now(), author: 'User' }],
        branches: [{ name: 'main', commitId: 'init' }],
        tags: [],
        head: { type: 'branch', ref: 'main' }
    },
    checkSuccess: (state) => state.branches.some(b => b.name === 'origin/main')
  },
  {
    id: '21_feature_cycle',
    section: 'Real World Workflows',
    title: '21. Project: Feature Lifecycle',
    description: 'Manage a full feature cycle like a pro:\n1. Create a branch named `new-login`\n2. Commit some work to it\n3. Push that branch to GitHub\n\nThis is the daily routine of a software engineer.',
    task: 'Branch -> Commit -> Push',
    hint: 'git checkout -b new-login && git commit -m "Add login" && git push -u origin new-login',
    initialState: {
        commits: [
            { id: 'start', message: 'App v1.0', parentId: null, secondParentId: null, timestamp: 1000, author: 'Origin' }
        ],
        branches: [
            { name: 'main', commitId: 'start' },
            { name: 'origin/main', commitId: 'start' }
        ],
        tags: [],
        head: { type: 'branch', ref: 'main' }
    },
    checkSuccess: (state) => {
        const local = state.branches.find(b => b.name === 'new-login');
        const remote = state.branches.find(b => b.name === 'origin/new-login');
        const hasCommits = state.commits.length > 1;
        return !!local && !!remote && hasCommits && local.commitId === remote.commitId;
    }
  },
  {
    id: '22_hotfix',
    section: 'Real World Workflows',
    title: '22. Project: Hotfix Workflow',
    description: 'Panic! A bug is in production. \n1. Switch back to `main`\n2. Create a branch `hotfix-v1`\n3. Commit a fix\n4. Merge it back into `main`\n\nThis happens when you are in the middle of other work but need to fix the live site immediately.',
    task: 'Main -> Branch Hotfix -> Commit -> Merge to Main',
    hint: 'git checkout main && git checkout -b hotfix-v1 && git commit -m "Fix bug" && git checkout main && git merge hotfix-v1',
    initialState: {
        commits: [
            { id: 'v1', message: 'Release v1.0', parentId: null, secondParentId: null, timestamp: 1000, author: 'User' },
            { id: 'wip', message: 'Half-done feature', parentId: 'v1', secondParentId: null, timestamp: 2000, author: 'User' }
        ],
        branches: [
            { name: 'main', commitId: 'v1' },
            { name: 'feature', commitId: 'wip' }
        ],
        tags: [],
        head: { type: 'branch', ref: 'feature' }
    },
    checkSuccess: (state) => {
        const main = state.branches.find(b => b.name === 'main');
        const tip = state.commits.find(c => c.id === main?.commitId);
        return tip?.message.includes('Merge') || (main?.commitId !== 'v1' && main?.commitId !== 'wip');
    }
  },
  {
    id: '23_terminal_push',
    section: 'Real World Workflows',
    title: '23. Terminal: From Scratch',
    description: 'This is the classic scenario: You created a new, empty repository on GitHub and want to push your local project to it.\n\nGitHub provides these 3 exact lines to run:\n\n1. `git remote add origin <url>` (Connects to GitHub)\n2. `git branch -M main` (Renames current branch to main)\n3. `git push -u origin main` (Uploads code)\n\nPerform this sequence to get your code online.',
    task: 'Remote -> Rename -> Push',
    hint: 'git remote add origin https://gh.com/me/repo.git && git branch -M main && git push -u origin main',
    initialState: {
        commits: [{ id: 'init', message: 'Final v1 code', parentId: null, secondParentId: null, timestamp: 1000, author: 'User' }],
        branches: [{ name: 'master', commitId: 'init' }], // Old default
        tags: [],
        head: { type: 'branch', ref: 'master' }
    },
    checkSuccess: (state) => {
        const hasRemote = state.branches.some(b => b.name === 'origin/main');
        const isMain = state.branches.some(b => b.name === 'main');
        const isMaster = state.branches.some(b => b.name === 'master');
        return hasRemote && isMain && !isMaster;
    }
  },

  // --- ADVANCED ---
  {
    id: '17_reset',
    section: 'Advanced Skills',
    title: '17. Reset (Hard)',
    description: 'Destructively move the current branch backward in time, discarding changes.',
    task: 'Reset to HEAD~1',
    hint: 'git reset --hard HEAD~1',
    initialState: {
        commits: [
            { id: 'good', message: 'Good', parentId: null, secondParentId: null, timestamp: 1000, author: 'User' },
            { id: 'bad', message: 'Bad', parentId: 'good', secondParentId: null, timestamp: 2000, author: 'User' }
        ],
        branches: [{ name: 'main', commitId: 'bad' }],
        tags: [],
        head: { type: 'branch', ref: 'main' }
    },
    checkSuccess: (state) => {
        const m = state.branches.find(b => b.name === 'main');
        return m?.commitId === 'good';
    }
  },
  {
    id: '18_revert',
    section: 'Advanced Skills',
    title: '18. Revert',
    description: 'Safely undo a commit by creating a new commit that reverses the changes.',
    task: 'Revert the "Bug" commit',
    hint: 'git revert bug',
    initialState: {
        commits: [
            { id: 'init', message: 'Init', parentId: null, secondParentId: null, timestamp: 1000, author: 'User' },
            { id: 'bug', message: 'Bug', parentId: 'init', secondParentId: null, timestamp: 2000, author: 'User' }
        ],
        branches: [{ name: 'main', commitId: 'bug' }],
        tags: [],
        head: { type: 'branch', ref: 'main' }
    },
    checkSuccess: (state) => state.commits.length === 3 && state.commits[2].message.includes('Revert')
  },
  {
    id: '19_cherry',
    section: 'Advanced Skills',
    title: '19. Cherry Pick',
    description: 'Copy a specific commit from one branch to another.',
    task: 'Cherry-pick "feature" into main',
    hint: 'git checkout main && git cherry-pick feat',
    initialState: {
        commits: [
            { id: 'root', message: 'Root', parentId: null, secondParentId: null, timestamp: 1000, author: 'User' },
            { id: 'm1', message: 'Main', parentId: 'root', secondParentId: null, timestamp: 2000, author: 'User' },
            { id: 'feat', message: 'Good Feature', parentId: 'root', secondParentId: null, timestamp: 3000, author: 'User' }
        ],
        branches: [
            { name: 'main', commitId: 'm1' },
            { name: 'feature', commitId: 'feat' }
        ],
        tags: [],
        head: { type: 'branch', ref: 'feature' }
    },
    checkSuccess: (state) => {
        const m = state.branches.find(b => b.name === 'main');
        const tip = state.commits.find(c => c.id === m?.commitId);
        return tip?.message === 'Good Feature';
    }
  }
];