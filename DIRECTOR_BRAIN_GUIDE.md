# 🧠 Director Brain - Hướng Dẫn Sử Dụng

## Tổng Quan

**Director Brain** là hệ thống AI tiến hóa, học từ sở thích của bạn để:
- 🎬 **Recommend Director** phù hợp với từng loại scene
- 📊 **Theo dõi Success Rate** của mỗi director
- 🎨 **Học Meta Tokens** bạn thích
- ☁️ **Sync xuyên thiết bị** qua Supabase

---

## Cách Hoạt Động

### 1. Auto-Learning (Tự Động)

Mỗi khi bạn **tạo ảnh**, Director Brain tự động ghi nhận:
- Director nào đang được dùng
- Context của scene (action, romantic, horror...)
- Meta tokens đang dùng

**Console log:**
```
[DirectorBrain] 🎬 Recorded generation. Total: 42
```

### 2. Explicit Feedback (Phản Hồi Trực Tiếp)

Sau khi ảnh được tạo, bạn sẽ thấy buttons **👍 / 👎** trên ảnh:

| Action | Ý nghĩa | Director Brain học gì? |
|--------|---------|------------------------|
| 👍 **Like** | Ảnh tốt, giữ lại | Boost director, learn positive tokens |
| 👎 **Dislike** | Ảnh không tốt | Decrease affinity, learn negative tokens |

### 3. Recommendations (Đề Xuất)

Khi bạn mở **Quick Director Picker** (icon 🎬 ở Production Hub):

```
🧠 AI Recommends
⭐ Christopher Nolan    92%
✓  Wong Kar-wai        85%
✓  Denis Villeneuve    73%

"92% success rate for action scenes"
```

Recommendations dựa trên:
- **Mood của scene hiện tại** (auto-detected từ context description)
- **Lịch sử success rate** của mỗi director
- **Recency** - Director mới dùng gần đây được ưu tiên

---

## Mood Detection

Director Brain tự động phát hiện mood từ scene context:

| Mood | Keywords |
|------|----------|
| **action** | fight, chase, explosion, battle, combat |
| **romantic** | love, kiss, embrace, tender, wedding |
| **horror** | dark, scary, monster, ghost, demon |
| **dramatic** | intense, confrontation, emotional, crying |
| **comedy** | funny, laugh, joke, silly |
| **mystery** | detective, clue, investigate, secret |
| **scifi** | space, future, robot, alien, cyber |
| **fantasy** | magic, dragon, wizard, fairy |
| **dialogue** | talking, conversation, meeting |
| **establishing** | wide, landscape, city, environment |

---

## Cloud Sync

### Setup (Một Lần)

1. Vào **Supabase Dashboard** → SQL Editor
2. Paste nội dung file `DIRECTOR_BRAIN_SCHEMA.sql`
3. Click **Run**

### Cách Sync Hoạt Động

```
LOGIN → Auto-fetch từ cloud → Merge với local → Update cloud nếu cần
       ↓
GENERATE/LIKE/DISLIKE → Save local → Debounce 5s → Auto-sync cloud
```

**Console logs:**
```
[App] 🧠 Syncing Director Brain from cloud...
[DirectorBrain] 📥 Loaded from cloud. Version: 5
[DirectorBrain] 🔀 Local memory is newer. Will sync to cloud.
[DirectorBrain] ☁️ Auto-syncing to cloud...
[DirectorBrain] 📤 Saved to cloud. Generations: 42
```

---

## Tips Sử Dụng

### 1. Rating Nhiều = Learning Tốt Hơn
Càng nhiều 👍/👎 → Recommendations càng chính xác

### 2. Kiên Nhẫn
Cần ít nhất **5 generations** với mỗi director để có đủ data

### 3. Xem Stats
Mở Quick Director Picker để xem:
- Tổng số generations
- Tỷ lệ like %
- Success rate mỗi director

### 4. Context Descriptions Rõ Ràng
Viết context description có keywords rõ ràng giúp mood detection chính xác hơn:

❌ "Hai người nói chuyện"
✅ "Emotional confrontation between two lovers, crying, sad atmosphere"

---

## Troubleshooting

### Memory Bị Reset?
- Check LocalStorage key: `genyu_director_brain`
- Nếu clear browser data → memory local mất
- Login lại → cloud memory được restore

### Không Thấy Recommendations?
- Cần ít nhất 2 uses với director
- Cần confidence score > 30%
- Chắc chắn có scene context

### Cloud Sync Không Hoạt Động?
- Kiểm tra đã chạy SQL schema chưa
- Check console log xem có error không
- Đảm bảo đã login

---

## Xem Memory (Debug)

Mở DevTools Console và chạy:

```javascript
// Xem toàn bộ memory
JSON.parse(localStorage.getItem('genyu_director_brain'))

// Xem director affinities
JSON.parse(localStorage.getItem('genyu_director_brain')).directorAffinities

// Xem learned tokens
JSON.parse(localStorage.getItem('genyu_director_brain')).learnedTokens

// Reset memory (cẩn thận!)
localStorage.removeItem('genyu_director_brain')
```

---

*Director Brain v1.0 - Tiến hóa theo thời gian! 🚀*
