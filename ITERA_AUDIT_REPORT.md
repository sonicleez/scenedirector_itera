# 🔍 ITERA BRANCH - PERFORMANCE AUDIT REPORT
**Date:** 2026-01-18 11:47
**Branch:** main (itera)
**Last Commit:** `d3da583`

---

## ⚠️ PERFORMANCE ANALYSIS - Image Generation Slow

### Nguyên nhân chính gây chậm:

| Issue | Impact | Location |
|-------|--------|----------|
| **Sequential Generation** | HIGH | Line 2032-2049 |
| **imageDelay 500ms** | MEDIUM | Line 2356-2357 |
| **DOP Validation** | MEDIUM | Line 2068-2095 |
| **Retry Backoff 2-8s** | LOW | Line 72-75 |

---

## 🔴 Issue 1: Sequential Generation (MAJOR)

**Location:** `useImageGeneration.ts:2032-2049`

```typescript
for (let i = 0; i < sortedScenes.length; i++) {
    const scene = sortedScenes[i];
    // ... awaits EACH scene one-by-one
    const result = await performImageGeneration(scene.id, ...);
    // ...
}
```

**Problem:** 
- 10 scenes × 15s/scene = **2.5 minutes** (sequential)
- Could be **45 seconds** with 4 concurrent

**Solution:** Need concurrent batch generation with configurable limit

---

## 🟡 Issue 2: imageDelay Between Scenes

**Location:** `useImageGeneration.ts:2356-2357`

```typescript
const imageDelay = state.generationConfig?.imageDelay || 500;
await new Promise(r => setTimeout(r, imageDelay));
```

**Problem:**
- Default 500ms between EACH scene
- 10 scenes = 5 seconds extra wait

**Solution:** Reduce default or set to 0 when not rate limited

---

## 🟡 Issue 3: DOP Validation Extra API Call

**Location:** `useImageGeneration.ts:2068-2095`

```typescript
if (isDOPEnabled && validateRaccordWithVision && currentImage) {
    let lastValidation = await validateRaccordWithVision(...);
    // This is ANOTHER Gemini API call per scene
}
```

**Problem:**
- Each scene triggers 2 API calls: 1 for image + 1 for validation
- Doubles the API time when DOP is enabled

**Solution:** Already has toggle (isDOPEnabled) - ensure user knows this affects speed

---

## 🟢 Issue 4: Retry Backoff

**Location:** `useImageGeneration.ts:72-75`

```typescript
// Exponential backoff: 2s, 4s, 8s
const waitTime = Math.pow(2, attempt) * 1000;
```

**Problem:** Only affects failed requests - acceptable

---

## ✅ QUICK FIXES AVAILABLE

### 1. Reduce imageDelay (Immediate)
User can change in Advanced Settings: `imageDelay: 0` instead of 500ms

### 2. Disable DOP During Batch (Optional)
- Turn off DOP toggle when speed is priority
- DOP adds ~10-15s per scene for validation

### 3. Use Faster Model
- `google_image_gen_4_5` (Imagen 4.5) - FREE & faster
- `flux_schnell` - fastest but no edit support

---

## � Build Status

| Metric | Value | Status |
|--------|-------|--------|
| **TypeScript Errors** | 0 | ✅ Clean |
| **Build Status** | Success (2.18s) | ✅ Pass |
| **Bundle Size** | ~504KB gzip | ✅ Good |

---

## 🚀 Recent Commits

| Commit | Type | Description |
|--------|------|-------------|
| `d3da583` | 🔧 Fix | Skip retry for policy violations |
| `0c0d5cd` | ✨ Feature | Add retry for 500/503 in batch |
| `8601a8d` | ✨ Feature | Add retry for composite images |
| `f3f72a3` | ✨ Feature | Character identity for Veo action |
| `58a65d5` | ✨ Feature | Spatial awareness (POV↔Frontal) |

---

## 💡 RECOMMENDED ACTIONS

### Immediate (User can do now):
1. **Settings → Advanced → Image Delay → Set to 0**
2. **Turn OFF DOP toggle during batch generation**
3. **Use Imagen 4.5 (FREE) for faster generation**

### Code Changes (Future):
1. Add concurrent generation option (generate 2-4 scenes simultaneously)
2. Add "Speed Mode" preset that disables DOP and reduces delays
3. Add progress ETA based on average generation time

---

## 📋 Generation Config Defaults

```typescript
generationConfig: {
    concurrentPrompts: 1,    // ← Should be 2-4 for speed
    imageDelay: 500,         // ← Can reduce to 0
    // DOP enabled by default ← Adds extra API call
}
```

---

**Overall Assessment:** 
- ✅ Code is correct and functional
- ⚠️ Sequential by design (for continuity/raccord)
- 💡 User settings can improve speed significantly
