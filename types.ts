export interface Commit {
  id: string;
  message: string;
  parentId: string | null;
  secondParentId: string | null; // For merges
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
    ref: string; // Branch name or Commit ID
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
  section: string; // Grouping category
  title: string;
  description: string;
  task: string; // The challenge text
  hint: string; // Command hint
  initialState: GitState; // State to load when lesson starts
  checkSuccess: (state: GitState) => boolean;
}