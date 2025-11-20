export interface LessonGuide {
  explanation: string;
  whyImportant: string;
  examples: Array<{
    title: string;
    command: string;
    description: string;
  }>;
  commonUseCases: string[];
  tips: string[];
  visualExplanation?: string;
}

export const LESSON_GUIDES: Record<string, LessonGuide> = {
  '1_init': {
    explanation: '`git init` is the first command you run in any new project. It creates a hidden `.git` folder that tracks all changes, commits, branches, and history. Think of it as turning a regular folder into a Git repository.',
    whyImportant: 'Without initializing a repository, Git has no way to track your files. This is the foundation of version control.',
    examples: [
      {
        title: 'Initialize a new project',
        command: 'git init',
        description: 'Creates a new Git repository in the current directory. You\'ll see a message confirming the repository was initialized.'
      },
      {
        title: 'Initialize with a specific branch name',
        command: 'git init -b main',
        description: 'Creates a repository and sets the default branch to "main" (modern Git default).'
      }
    ],
    commonUseCases: [
      'Starting a new project from scratch',
      'Converting an existing folder into a Git repository',
      'Setting up version control for a new codebase'
    ],
    tips: [
      'You only need to run `git init` once per project',
      'The `.git` folder is hidden - don\'t delete it!',
      'You can have nested Git repositories, but it\'s usually not recommended'
    ]
  },
  '2_add': {
    explanation: '`git add` moves files from your working directory to the staging area. The staging area is like a "preview" of what will be saved in your next commit. This two-step process (add then commit) gives you control over exactly what gets saved.',
    whyImportant: 'Staging lets you commit only specific files, even if you\'ve modified many. It helps you create logical, focused commits.',
    examples: [
      {
        title: 'Stage all changes',
        command: 'git add .',
        description: 'Stages all modified and new files in the current directory and subdirectories.'
      },
      {
        title: 'Stage a specific file',
        command: 'git add index.html',
        description: 'Stages only the index.html file, leaving other changes unstaged.'
      },
      {
        title: 'Stage multiple files',
        command: 'git add file1.js file2.css',
        description: 'Stages only the specified files.'
      }
    ],
    commonUseCases: [
      'Preparing files for a commit',
      'Selectively staging related changes together',
      'Reviewing changes before committing'
    ],
    tips: [
      'Use `git status` to see what\'s staged vs unstaged',
      'You can stage files multiple times before committing',
      'Staging doesn\'t save anything yet - you still need to commit!'
    ]
  },
  '3_commit': {
    explanation: '`git commit` permanently saves your staged changes to the repository. Each commit is like a snapshot of your project at that moment. Commits include a message describing what changed and why. They create a permanent history you can always go back to.',
    whyImportant: 'Commits are the building blocks of your project history. They let you track progress, revert mistakes, and understand how your code evolved.',
    examples: [
      {
        title: 'Commit with a message',
        command: 'git commit -m "Add login feature"',
        description: 'Creates a commit with the message "Add login feature". The -m flag lets you write the message directly in the command.'
      },
      {
        title: 'Commit with a detailed message',
        command: 'git commit -m "Fix bug" -m "Resolved issue where users couldn\'t log in"',
        description: 'Creates a commit with a title and body. The first -m is the title, the second is the body.'
      }
    ],
    commonUseCases: [
      'Saving completed features',
      'Creating checkpoints in your work',
      'Documenting changes for your team'
    ],
    tips: [
      'Write clear, descriptive commit messages',
      'Commit often - small, frequent commits are better than large ones',
      'Each commit should represent one logical change'
    ],
    visualExplanation: 'Before commit: Working Directory → Staging Area → (nothing saved yet)\nAfter commit: Working Directory → Staging Area → Repository (saved!)'
  },
  '4_amend': {
    explanation: '`git commit --amend` lets you modify the most recent commit. You can change the commit message or add more changes to it. It\'s like having an "undo" button for your last commit, but better - you can fix it instead of creating a new commit.',
    whyImportant: 'Perfect for fixing typos in commit messages or adding files you forgot to include. It keeps your history clean instead of having "fix typo" commits everywhere.',
    examples: [
      {
        title: 'Fix commit message',
        command: 'git commit --amend -m "Corrected message"',
        description: 'Replaces the last commit message with "Corrected message".'
      },
      {
        title: 'Add forgotten file to last commit',
        command: 'git add forgotten-file.js\ngit commit --amend --no-edit',
        description: 'Adds forgotten-file.js to the previous commit without changing the message. --no-edit keeps the original message.'
      }
    ],
    commonUseCases: [
      'Fixing typos in commit messages',
      'Adding files you forgot to include',
      'Combining small fixes into one commit'
    ],
    tips: [
      'Only amend commits that haven\'t been pushed yet (or coordinate with your team)',
      'Amending changes the commit hash, so it creates a "new" commit',
      'Use --no-edit to keep the original message when just adding files'
    ]
  },
  '5_log': {
    explanation: '`git log` shows you the history of commits in your repository. It displays who made each commit, when, and what the commit message was. It\'s like a timeline of your project\'s development.',
    whyImportant: 'Understanding your project history helps you see how it evolved, find when bugs were introduced, and understand the context of changes.',
    examples: [
      {
        title: 'View commit history',
        command: 'git log',
        description: 'Shows all commits with their hash, author, date, and message. Press "q" to exit.'
      },
      {
        title: 'Compact one-line view',
        command: 'git log --oneline',
        description: 'Shows each commit on a single line with just the hash and message.'
      },
      {
        title: 'See last 5 commits',
        command: 'git log -5',
        description: 'Shows only the 5 most recent commits.'
      }
    ],
    commonUseCases: [
      'Reviewing what changed recently',
      'Finding when a feature was added',
      'Understanding project history'
    ],
    tips: [
      'Use arrow keys to scroll through log output',
      'Press "q" to quit the log viewer',
      'Combine with --graph to see branch structure visually'
    ]
  },
  '6_branch': {
    explanation: 'Branches are like parallel timelines for your project. They let you work on features without affecting the main code. Think of branches as creating a copy of your code that you can experiment with safely.',
    whyImportant: 'Branches enable collaboration and experimentation. You can work on multiple features simultaneously, and merge them back when ready.',
    examples: [
      {
        title: 'Create a new branch',
        command: 'git branch feature-login',
        description: 'Creates a new branch called "feature-login" but doesn\'t switch to it yet.'
      },
      {
        title: 'List all branches',
        command: 'git branch',
        description: 'Shows all branches. The current branch is marked with an asterisk (*).'
      },
      {
        title: 'Delete a branch',
        command: 'git branch -d feature-login',
        description: 'Deletes the branch (only if it\'s been merged). Use -D to force delete.'
      }
    ],
    commonUseCases: [
      'Working on a new feature',
      'Fixing a bug without affecting main code',
      'Experimenting with different approaches'
    ],
    tips: [
      'Branches are lightweight - create them freely!',
      'Each branch is independent until you merge',
      'The default branch is usually "main" or "master"'
    ],
    visualExplanation: 'main: A → B → C\nfeature: A → B → D → E\n\nBoth branches share history up to B, then diverge.'
  },
  '7_checkout': {
    explanation: '`git checkout` switches between branches or commits. It updates your working directory to match the selected branch. When you switch branches, Git automatically changes your files to match that branch\'s version.',
    whyImportant: 'Switching branches lets you work on different features and see different versions of your code instantly.',
    examples: [
      {
        title: 'Switch to a branch',
        command: 'git checkout feature-login',
        description: 'Switches to the feature-login branch. Your files will change to match that branch.'
      },
      {
        title: 'Create and switch in one command',
        command: 'git checkout -b new-feature',
        description: 'Creates a new branch called "new-feature" and immediately switches to it. Equivalent to `git branch new-feature` then `git checkout new-feature`.'
      },
      {
        title: 'Switch to a specific commit',
        command: 'git checkout abc1234',
        description: 'Switches to a specific commit (enters "detached HEAD" state). Useful for viewing old code.'
      }
    ],
    commonUseCases: [
      'Switching between features',
      'Reviewing code from different branches',
      'Going back to previous versions'
    ],
    tips: [
      'Make sure you commit or stash changes before switching branches',
      'Modern Git also has `git switch` as an alternative',
      'Detached HEAD means you\'re not on any branch - create a branch if you want to make changes'
    ]
  },
  '8_ff_merge': {
    explanation: 'A fast-forward merge happens when the branch you\'re merging is directly ahead of your current branch. Git simply moves your branch pointer forward - no merge commit needed! It\'s like fast-forwarding a video to catch up.',
    whyImportant: 'Fast-forward merges keep history linear and clean. They\'re the simplest type of merge.',
    examples: [
      {
        title: 'Fast-forward merge',
        command: 'git checkout main\ngit merge feature',
        description: 'If feature is ahead of main with no diverging commits, main simply moves forward to match feature.'
      }
    ],
    commonUseCases: [
      'Merging a feature branch that was created from main',
      'Updating main with completed work',
      'Keeping a linear project history'
    ],
    tips: [
      'Fast-forward only works when there are no conflicts',
      'The branch pointer just moves forward - no new commit is created',
      'This is the cleanest type of merge'
    ],
    visualExplanation: 'Before: main → A → B\n         feature → A → B → C → D\n\nAfter:  main → A → B → C → D\n        feature → A → B → C → D\n\nMain "caught up" to feature!'
  },
  '9_merge': {
    explanation: 'A three-way merge combines two branches that have diverged (both have new commits). Git creates a special "merge commit" that has two parents - one from each branch. This preserves the history of both branches.',
    whyImportant: 'When branches diverge, you need a merge commit to combine them. This shows that work happened in parallel and was then combined.',
    examples: [
      {
        title: 'Merge diverged branches',
        command: 'git checkout main\ngit merge feature',
        description: 'Creates a merge commit that combines main and feature. The merge commit has two parents.'
      }
    ],
    commonUseCases: [
      'Combining work from different team members',
      'Merging a feature that was worked on while main also changed',
      'Integrating parallel development streams'
    ],
    tips: [
      'Merge commits have two parents (the two branch tips)',
      'Git automatically tries to combine changes',
      'You may need to resolve conflicts if the same lines were changed'
    ],
    visualExplanation: 'Before: main → A → B → C\n         feature → A → B → D\n\nAfter:  main → A → B → C → M\n                      ↘ D ↗\n\nM is the merge commit with two parents (C and D)'
  },
  '10_tag': {
    explanation: 'Tags are labels for specific commits, usually marking important milestones like releases. Unlike branches, tags don\'t move - they always point to the same commit. Think of them as bookmarks in your history.',
    whyImportant: 'Tags help you mark and find important versions of your code, like "v1.0" or "production-release".',
    examples: [
      {
        title: 'Create a tag',
        command: 'git tag v1.0',
        description: 'Creates a tag called "v1.0" at the current commit.'
      },
      {
        title: 'Tag a specific commit',
        command: 'git tag v1.0 abc1234',
        description: 'Creates a tag at a specific commit hash.'
      },
      {
        title: 'List all tags',
        command: 'git tag',
        description: 'Shows all tags in the repository.'
      }
    ],
    commonUseCases: [
      'Marking release versions',
      'Tagging important milestones',
      'Creating reference points in history'
    ],
    tips: [
      'Tags are permanent markers - they don\'t move like branches',
      'Use semantic versioning: v1.0, v1.1, v2.0, etc.',
      'Tags are great for releases and important checkpoints'
    ]
  },
  '12_remote': {
    explanation: 'Remotes are connections to other repositories, usually on GitHub or another server. The default remote is called "origin". Remotes let you share your code and collaborate with others.',
    whyImportant: 'Remotes enable collaboration, backup, and sharing. They\'re the bridge between your local repository and the shared repository online.',
    examples: [
      {
        title: 'Add a remote',
        command: 'git remote add origin https://github.com/user/repo.git',
        description: 'Connects your local repo to a GitHub repository. "origin" is the conventional name for the main remote.'
      },
      {
        title: 'View remotes',
        command: 'git remote -v',
        description: 'Shows all configured remotes with their URLs.'
      },
      {
        title: 'Remove a remote',
        command: 'git remote remove origin',
        description: 'Removes the remote connection.'
      }
    ],
    commonUseCases: [
      'Connecting to GitHub',
      'Setting up collaboration',
      'Backing up your code online'
    ],
    tips: [
      '"origin" is just a name - you can use any name',
      'You can have multiple remotes',
      'HTTPS and SSH are the two main URL formats'
    ]
  },
  '13_clone': {
    explanation: '`git clone` downloads an entire repository from a remote (like GitHub) to your computer. It creates a complete copy including all history, branches, and commits. It\'s like downloading a project to work on it locally.',
    whyImportant: 'Cloning is how you get started with existing projects. It\'s the first step when joining a team or contributing to open source.',
    examples: [
      {
        title: 'Clone a repository',
        command: 'git clone https://github.com/user/repo.git',
        description: 'Downloads the repository into a folder called "repo" in your current directory.'
      },
      {
        title: 'Clone to a specific folder',
        command: 'git clone https://github.com/user/repo.git my-project',
        description: 'Clones the repo into a folder named "my-project".'
      }
    ],
    commonUseCases: [
      'Getting a copy of a project to work on',
      'Contributing to open source',
      'Setting up a project on a new computer'
    ],
    tips: [
      'Clone only needs to be done once per project',
      'After cloning, you have the full history',
      'The remote "origin" is automatically configured'
    ]
  },
  '14_push': {
    explanation: '`git push` uploads your local commits to a remote repository. It sends your changes to GitHub (or another remote) so others can see and use them. Think of it as "publishing" your work.',
    whyImportant: 'Pushing shares your work with your team and backs it up online. Without pushing, your commits only exist on your computer.',
    examples: [
      {
        title: 'Push to remote',
        command: 'git push origin main',
        description: 'Uploads your local "main" branch to the "origin" remote.'
      },
      {
        title: 'Set upstream and push',
        command: 'git push -u origin main',
        description: 'Pushes and sets "origin/main" as the upstream branch. After this, you can just use `git push`.'
      }
    ],
    commonUseCases: [
      'Sharing your work with teammates',
      'Backing up commits online',
      'Updating a remote repository'
    ],
    tips: [
      'Always pull before pushing if others are working on the same branch',
      'Use -u flag the first time to set upstream',
      'Push regularly to keep your remote updated'
    ]
  },
  '15_fetch': {
    explanation: '`git fetch` downloads new commits from a remote without merging them into your current branch. It updates your knowledge of what\'s on the remote, but doesn\'t change your working files. It\'s like checking for updates without installing them yet.',
    whyImportant: 'Fetching lets you see what others have done without changing your code. You can review changes before deciding to merge them.',
    examples: [
      {
        title: 'Fetch from remote',
        command: 'git fetch origin',
        description: 'Downloads new commits from origin but doesn\'t merge them. Your files stay the same.'
      },
      {
        title: 'Fetch all remotes',
        command: 'git fetch',
        description: 'Fetches from all configured remotes.'
      }
    ],
    commonUseCases: [
      'Checking for updates without merging',
      'Reviewing what others have pushed',
      'Updating remote branch references'
    ],
    tips: [
      'Fetch is safe - it never changes your working files',
      'After fetching, you can see remote branches with `git branch -r`',
      'Fetch + merge = pull (but fetch gives you more control)'
    ]
  },
  '16_pull': {
    explanation: '`git pull` is a combination of `git fetch` and `git merge`. It downloads new commits from the remote AND merges them into your current branch in one step. It\'s the quick way to update your local branch with remote changes.',
    whyImportant: 'Pulling keeps your local branch synchronized with the remote. It\'s essential for staying up-to-date with team changes.',
    examples: [
      {
        title: 'Pull latest changes',
        command: 'git pull origin main',
        description: 'Fetches and merges changes from origin/main into your current branch.'
      },
      {
        title: 'Pull from upstream',
        command: 'git pull',
        description: 'Pulls from the configured upstream branch (set with -u flag).'
      }
    ],
    commonUseCases: [
      'Updating your branch with team changes',
      'Getting the latest code before starting work',
      'Synchronizing with remote repository'
    ],
    tips: [
      'Always pull before pushing to avoid conflicts',
      'Pull regularly to stay updated',
      'If there are conflicts, Git will ask you to resolve them'
    ]
  },
  '17_reset': {
    explanation: '`git reset --hard` moves your branch pointer backward and discards changes. It\'s destructive - you lose commits and changes. Use it when you want to completely undo work and go back to a previous state.',
    whyImportant: 'Reset is powerful but dangerous. It lets you undo mistakes, but be careful - the changes are gone!',
    examples: [
      {
        title: 'Reset to previous commit',
        command: 'git reset --hard HEAD~1',
        description: 'Moves back one commit and discards all changes. HEAD~1 means "one commit before HEAD".'
      },
      {
        title: 'Reset to specific commit',
        command: 'git reset --hard abc1234',
        description: 'Resets to a specific commit hash, discarding everything after it.'
      }
    ],
    commonUseCases: [
      'Undoing recent commits',
      'Starting over from a clean state',
      'Removing experimental work'
    ],
    tips: [
      '⚠️ WARNING: Reset is destructive - you lose commits!',
      'Only reset commits that haven\'t been pushed (or coordinate with team)',
      'Use `git reflog` to recover if you reset by mistake'
    ]
  },
  '18_revert': {
    explanation: '`git revert` safely undoes a commit by creating a new commit that reverses the changes. Unlike reset, it doesn\'t delete history - it adds a new commit that undoes the old one. This is safe for commits that have been shared.',
    whyImportant: 'Revert is the safe way to undo commits that others might have. It preserves history and works well with shared repositories.',
    examples: [
      {
        title: 'Revert a commit',
        command: 'git revert abc1234',
        description: 'Creates a new commit that undoes the changes from commit abc1234.'
      },
      {
        title: 'Revert without opening editor',
        command: 'git revert --no-edit abc1234',
        description: 'Reverts without prompting for a commit message (uses default message).'
      }
    ],
    commonUseCases: [
      'Undoing a commit that was already pushed',
      'Safely removing a feature',
      'Fixing a bug that was introduced in a previous commit'
    ],
    tips: [
      'Revert is safe - it doesn\'t delete history',
      'It creates a new commit, so history is preserved',
      'Perfect for undoing commits that others have pulled'
    ]
  },
  '19_cherry': {
    explanation: '`git cherry-pick` copies a specific commit from one branch to another. It takes the changes from that commit and applies them to your current branch. Useful for bringing a single commit from a feature branch into main without merging the whole branch.',
    whyImportant: 'Cherry-picking lets you selectively apply commits. You can take just the commits you want without merging everything.',
    examples: [
      {
        title: 'Cherry-pick a commit',
        command: 'git cherry-pick abc1234',
        description: 'Applies the changes from commit abc1234 to your current branch.'
      },
      {
        title: 'Cherry-pick multiple commits',
        command: 'git cherry-pick abc1234 def5678',
        description: 'Applies multiple commits in order.'
      }
    ],
    commonUseCases: [
      'Applying a bug fix from one branch to another',
      'Selectively bringing commits from feature branches',
      'Backporting fixes to older versions'
    ],
    tips: [
      'Cherry-pick creates a new commit (with a new hash)',
      'The commit message is usually preserved',
      'Useful when you want specific commits but not the whole branch'
    ]
  },
  '11_detached': {
    explanation: 'Detached HEAD is a special state where you\'re viewing a specific commit, not a branch. Your HEAD pointer points directly to a commit instead of a branch name. You can look around and make experimental changes, but you\'re not on any branch.',
    whyImportant: 'Understanding detached HEAD helps you navigate Git history safely. It\'s useful for viewing old code, but you need to create a branch if you want to keep changes.',
    examples: [
      {
        title: 'Checkout a specific commit',
        command: 'git checkout abc1234',
        description: 'Switches to a specific commit, entering detached HEAD state. Git will warn you about this.'
      },
      {
        title: 'Create a branch from detached HEAD',
        command: 'git checkout -b new-branch',
        description: 'If you\'re in detached HEAD and want to keep changes, create a branch. This saves your work.'
      }
    ],
    commonUseCases: [
      'Viewing code from a previous commit',
      'Testing old versions',
      'Investigating when a bug was introduced'
    ],
    tips: [
      'Detached HEAD is temporary - create a branch to save work',
      'Git warns you when entering detached HEAD',
      'You can checkout any commit, tag, or branch'
    ]
  },
  '20_publish': {
    explanation: 'Publishing a branch means connecting your local repository to a remote (like GitHub) and pushing your code for the first time. This is typically done when you create a new project and want to share it online.',
    whyImportant: 'Publishing makes your code available online, enables collaboration, and provides a backup of your work.',
    examples: [
      {
        title: 'Publish to GitHub',
        command: 'git remote add origin https://github.com/user/repo.git\ngit push -u origin main',
        description: 'First adds the remote, then pushes your main branch. The -u flag sets upstream so future pushes are easier.'
      }
    ],
    commonUseCases: [
      'Sharing a new project',
      'Setting up a repository on GitHub',
      'Making code accessible to others'
    ],
    tips: [
      'You only need to add the remote once',
      'Use -u flag to set upstream tracking',
      'After publishing, you can just use `git push`'
    ]
  },
  '21_feature_cycle': {
    explanation: 'The feature lifecycle is the standard workflow: create a branch, make commits, and push to remote. This is how most development teams work - each feature gets its own branch.',
    whyImportant: 'This workflow keeps main stable while allowing parallel development. It\'s the foundation of collaborative Git workflows.',
    examples: [
      {
        title: 'Complete feature workflow',
        command: 'git checkout -b new-login\ngit commit -m "Add login form"\ngit push -u origin new-login',
        description: 'Creates a branch, makes a commit, and pushes it to GitHub. This is the standard development cycle.'
      }
    ],
    commonUseCases: [
      'Working on new features',
      'Collaborative development',
      'Isolating work from main branch'
    ],
    tips: [
      'Always create a branch for new features',
      'Push regularly to backup your work',
      'Use descriptive branch names'
    ]
  },
  '22_hotfix': {
    explanation: 'A hotfix is an urgent fix that needs to go to production immediately, even if you\'re working on other features. You switch back to main, create a hotfix branch, fix the issue, and merge it back quickly.',
    whyImportant: 'Hotfixes let you fix production issues without disrupting your current work. They follow a strict process to ensure stability.',
    examples: [
      {
        title: 'Hotfix workflow',
        command: 'git checkout main\ngit checkout -b hotfix-v1\ngit commit -m "Fix critical bug"\ngit checkout main\ngit merge hotfix-v1',
        description: 'Switches to main, creates hotfix branch, fixes issue, merges back to main. This is the standard hotfix process.'
      }
    ],
    commonUseCases: [
      'Fixing production bugs',
      'Urgent security patches',
      'Critical issues that can\'t wait'
    ],
    tips: [
      'Hotfixes should be small and focused',
      'Always merge back to main immediately',
      'Test thoroughly before merging'
    ]
  },
  '23_terminal_push': {
    explanation: 'This is the classic GitHub workflow: add a remote, rename your branch to main (if needed), and push. GitHub provides these exact commands when you create a new empty repository.',
    whyImportant: 'This is the standard way to connect a local project to GitHub. It\'s the first step in sharing your code.',
    examples: [
      {
        title: 'Complete setup',
        command: 'git remote add origin https://github.com/user/repo.git\ngit branch -M main\ngit push -u origin main',
        description: 'Three-step process: connect to GitHub, rename branch to main, and push. This is what GitHub shows you for a new repo.'
      }
    ],
    commonUseCases: [
      'Setting up a new GitHub repository',
      'Connecting local project to remote',
      'Initial push of existing code'
    ],
    tips: [
      'GitHub provides these exact commands',
      'The -M flag renames the branch',
      'After this, you can use `git push` normally'
    ]
  }
};

