export const STATE_GROUPS = [
  {
    id: 'ambient',
    label: '日常',
    states: [
      { id: 'idle', label: '待机' },
      { id: 'waving', label: '打招呼' },
      { id: 'jumping', label: '跳跃' }
    ]
  },
  {
    id: 'movement',
    label: '移动',
    states: [
      { id: 'running-left', label: '向左移动' },
      { id: 'running-right', label: '向右移动' }
    ]
  },
  {
    id: 'task',
    label: '任务',
    states: [
      { id: 'running', label: '思考工作' },
      { id: 'waiting', label: '等待输入' },
      { id: 'review', label: '检查结果' },
      { id: 'failed', label: '失败' }
    ]
  },
  {
    id: 'desktop',
    label: '桌面专属',
    states: [
      { id: 'sleep', label: '屏幕边缘睡觉' }
    ]
  }
];

// Both editions use the same v2 row layout. Sleep reuses the existing
// collapse poses from row 5 without changing either Work-compatible atlas.
export const DESKTOP_ANIMATIONS = {
  'sleep-enter': {
    row: 5,
    frameIndices: [0, 1, 2, 3, 4],
    durationsMs: [180, 160, 190, 240, 360],
    loop: false,
    next: 'sleep'
  },
  sleep: {
    row: 5,
    frameIndices: [4, 4, 3, 4],
    durationsMs: [1100, 1500, 260, 1500],
    loop: true
  },
  'sleep-exit': {
    row: 5,
    frameIndices: [4, 3, 2, 1, 0],
    durationsMs: [180, 170, 150, 140, 220],
    loop: false,
    next: 'idle'
  }
};

export function withDesktopStates(manifest) {
  return {
    ...manifest,
    animations: {
      ...manifest.animations,
      ...DESKTOP_ANIMATIONS
    }
  };
}

export function animationDuration(animation) {
  return animation.durationsMs.reduce((total, duration) => total + duration, 0);
}
