# Electron state model

The Electron companion supports both `Normal` and `8-bit` editions. They share
one state model because both atlases use the same v2 row and cell geometry.

| Group | Public state | Atlas source | Behavior |
|---|---|---|---|
| Ambient | `idle` | row 0 | Calm loop and pointer gaze |
| Ambient | `waving` | row 3 | One-shot greeting |
| Ambient | `jumping` | row 4 | One-shot jump |
| Movement | `running-left` | row 2 | Move toward screen-left |
| Movement | `running-right` | row 1 | Move toward screen-right |
| Task | `running` | row 7 | Thinking or active work |
| Task | `waiting` | row 6 | Waiting for input |
| Task | `review` | row 8 | Inspecting output |
| Task | `failed` | row 5 | One-shot failure reaction |
| Desktop | `sleep` | selected row 5 frames | Edge-sleep loop |

## Sleep lifecycle

`sleep` is the single public desktop state. Internally it uses three phases:

1. `sleep-enter` lowers the pigeon from standing into the resting pose.
2. `sleep` holds a slow breathing loop at the screen's lowest visible edge.
3. `sleep-exit` reverses the pose sequence before returning to `idle`.

The Electron window is resized to one `192x208` cell while sleeping. On Windows
it rests on the taskbar edge. On macOS it rests on the bottom Dock edge when the
Dock is visible, and falls back to the physical screen edge when the Dock is
auto-hidden or positioned vertically.

The sleep definitions live in `runtime/desktop-states.js`; the standard Work
manifests and sprite sheets remain unchanged.
