export interface Commit {
  id: string;
  message: string;
  parentId: string | null;
  secondParentId: string | null;
  timestamp: number;
  author: string;
}

export interface Branch {
  name: string;
  commitId: string;
}

export interface Tag {
  name: string;
  commitId: string;
}

export interface GitState {
  commits: Commit[];
  branches: Branch[];
  tags: Tag[];
  head: {
    type: 'branch' | 'commit';
    ref: string;
  };
}

export interface LogEntry {
  id: string;
  type: 'command' | 'output' | 'error' | 'success' | 'info';
  text: string;
}

export interface GraphNode extends Commit {
  x: number;
  y: number;
  color: string;
  lane: number;
}

export interface GraphLink {
  source: GraphNode;
  target: GraphNode;
  isMerge: boolean;
}

export interface Lesson {
  id: string;
  section: string;
  title: string;
  description: string;
  task: string;
  hint: string;
  initialState: GitState;
  checkSuccess: (state: GitState) => boolean;
}