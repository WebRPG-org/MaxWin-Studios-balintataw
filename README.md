# balintataw
A puzzle horror game created by Maxwell section for Relicon 2025 using RPGMaker MV 

# 🎮 Project Git Guide — RPG Maker MV Team

> How everyone (artists, writers, audio, programmers, QA) works with our repository using **GitHub/GitHub Desktop**.

---

## 🧩 1. Branch Workflow

### 📚 Main Branches

| Branch | Purpose | Who edits |
|--------|---------|-----------|
| `main` | Stable releases only | Release Manager |
| `develop` | Ongoing integration branch | Programmers, Leads |
| `staging` | Demo/Nightly builds for QA | CI only |
| `release/x.x.x` | Frozen version for polishing | Leads |
| `hotfix/issue-name` | Emergency fixes | Programmers |

### 🎨 Content & Feature Branches

| Type | Example | Used by |
|------|---------|---------|
| `content-art/` | `content-art/tileset-forest` | Artists |
| `content-audio/` | `content-audio/bgm-dungeon` | Musicians |
| `content-narrative/` | `content-narrative/ch1-dialogue` | Writers |
| `content-qa/` | `content-qa/cycle-001` | QA team |
| `feature/` | `feature/mechanics/healthbar` | Programmers |

### 🧭 Create a Branch (GitHub Desktop)
1. **Current Branch → New Branch**  
2. Name it (e.g. `content-art/tileset-lighthouse`)  
3. **Create Branch → Publish Branch**  

*Screenshot placeholder:*  

<img width="1340" height="930" alt="image" src="https://github.com/user-attachments/assets/59886976-21b2-47e9-9c37-314330d0365c" />

<img width="1340" height="930" alt="image" src="https://github.com/user-attachments/assets/b6641433-06fb-479c-8229-b267644f6617" />

<img width="1340" height="930" alt="image" src="https://github.com/user-attachments/assets/f293dc11-473c-4efb-91f6-1a9d0d9148b1" />

---

## 🧱 2. Commit Message Format

**Pattern:**
[type]/[area]: [short description]

**Examples:**
feature/journal: add journal logic
content-art: update hero idle sprite
content-audio: normalize bgm loops
content-narrative: rewrite act 2 intro
content-qa: add puzzle1 repro saves
fix/ui: prevent pause-menu flicker

**Rules**
- One logical change per commit  
- First line ≤ 60 chars  
- Present tense (“add,” not “added”)  
- Optional second line for notes / issue ID  

*Sample:*  

<img width="1340" height="930" alt="image" src="https://github.com/user-attachments/assets/3a52660d-d355-46ca-b7bb-1dc9be4b2b4a" />

---

## 🔀 3. Pull Request (PR) Format

**Target:** PRs go **into `develop`** (except hotfixes → `main`).

**Title:**
[type]: [short summary]

**PR Body Template:**
Type: feature | content-art | content-audio | narrative | fix | hotfix
Summary: What changed (1–2 lines)
Test: How to verify (screenshots, saves)
Impact: Files touched / possible conflicts

*Sample:*  
<img width="915" height="600" alt="image" src="https://github.com/user-attachments/assets/9dbcb721-c2bf-41ab-9c0f-38f9773af7cc" />

<img width="1130" height="918" alt="image" src="https://github.com/user-attachments/assets/5d92fd0f-64bd-4b0a-b658-b3e7bf50e0fa" />

---

## 🧰 4. File & Folder Naming Conventions

| Type | Case Style | Example | Notes |
|------|------------|---------|-------|
| **Folders** | snake_case | `bgm`, `img`, `sv_actors`
| **JS plugins** | PascalCase | `BlinkDetector.js` 
| **Assets (images, audio)** | snake_case | `hero_idle.png`, `bgm_forest_loop.ogg` 
| **Assets (tilesets)** | snake_case | `A2_all_00.png`, `A5_map_00.png` 
| **Assets (tilesets)** | PascalCase | `Layer2.png`, `Layer3.png` 
| **JSON / data** | PascalCase | `CommonEvents.json`, `ContainerProperties.json` 
| **Docs** | PascalCase | `README_TEAM.md`, `CHANGELOG.md` 
| **Branches** | kebab + prefixes | `feature/ui-hud`, `content-art/tileset-castle` 

*Sample:*  
<img width="757" height="534" alt="image" src="https://github.com/user-attachments/assets/545ff193-f987-4280-97cb-cd96e83ea5c1" />

<img width="883" height="427" alt="image" src="https://github.com/user-attachments/assets/6a33c828-078a-438c-ad7b-6879719ab158" />

<img width="1256" height="399" alt="image" src="https://github.com/user-attachments/assets/bca7f219-b700-438e-9a0e-3e5e26fb1ff4" />

<img width="829" height="64" alt="image" src="https://github.com/user-attachments/assets/e62c2353-8539-4ca8-a715-9efb1dac52f4" />

<img width="874" height="447" alt="image" src="https://github.com/user-attachments/assets/ee92dd1e-8c7a-4ddf-8242-2d53ed610715" />

<img width="767" height="160" alt="image" src="https://github.com/user-attachments/assets/fb874dbd-b203-4dd2-9ea6-b5703a493c17" />


---

## 🔒 5. Binary Assets (Images, Audio) & Git LFS

We use **Git LFS** to avoid huge repos & bad merges. Binary files are **lockable**.

**One-time setup (local):**

`git lfs install`

.gitattributes (at repo root):
# Images
*.png filter=lfs diff=lfs merge=lfs -text lockable
*.jpg filter=lfs diff=lfs merge=lfs -text lockable
*.psd filter=lfs diff=lfs merge=lfs -text lockable
*.aseprite filter=lfs diff=lfs merge=lfs -text lockable
# Audio
*.wav filter=lfs diff=lfs merge=lfs -text lockable
*.ogg filter=lfs diff=lfs merge=lfs -text lockable
*.mp3 filter=lfs diff=lfs merge=lfs -text lockable
# Video
*.mp4 *.webm filter=lfs diff=lfs merge=lfs -text lockable
# RPG Maker MV data (text-friendly)
*.json text eol=lf
# Ignore builds/saves
/www/save/*  export-ignore
/build/*     export-ignore
/dist/*      export-ignore


