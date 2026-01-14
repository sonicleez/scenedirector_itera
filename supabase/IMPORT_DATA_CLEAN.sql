-- =============================================
-- IMPORT DATA: From Supabase Cloud to Self-hosted
-- Run this in Self-hosted SQL Editor
-- =============================================

-- Disable triggers during import
ALTER TABLE public.dop_model_learnings DISABLE TRIGGER ALL;
ALTER TABLE public.user_global_stats DISABLE TRIGGER ALL;

-- 1. DOP MODEL LEARNINGS
INSERT INTO public.dop_model_learnings (id, model_type, total_generations, approved_count, avg_quality_score, approval_rate, best_aspect_ratios, common_keywords, successful_patterns, updated_at, failure_patterns, rejection_counts)
VALUES 
('b6a66268-b1a1-41de-8c56-916c812aac2d', 'midjourney', 2, 0, 0, 0, '{}', '{}', '{}', '2026-01-05 08:02:06.733+00', '{}', '{}'),
('093265b8-0870-4d21-9e59-fb4d2d96b27a', 'gemini', 1000, 66, 0.7969697, 0.066, '{"16:9": 66}', '{"8k": 66, "anime": 66, "sharp": 7, "cartoon": 66, "detailed": 66, "dramatic": 66, "lighting": 66, "cinematic": 66, "full body": 34, "landscape": 66, "realistic": 66, "head to toe": 66, "masterpiece": 66, "illustration": 66, "photorealistic": 66}', '{cinematic,realistic,8k,detailed,lighting,landscape,masterpiece,anime,cartoon,illustration,photorealistic,dramatic,"head to toe","full body",sharp}', '2026-01-13 10:53:27.58+00', '{}', '{}'),
('4a769ce3-42d7-4e6d-89e3-2723b80b7dd7', 'seedream', 27, 2, 0.95, 0.074074075, '{"16:9": 2}', '{"sharp": 1, "cinematic": 2, "realistic": 2, "masterpiece": 2, "photorealistic": 2}', '{cinematic,realistic,masterpiece,photorealistic,sharp}', '2026-01-05 07:09:47.543+00', '{}', '{}'),
('a7e9cfb0-84fe-47e3-8a03-ebc6508b313d', 'kling', 2, 0, 0, 0, '{}', '{}', '{}', '2026-01-05 07:23:34.541+00', '{}', '{}')
ON CONFLICT (model_type) DO UPDATE SET
  total_generations = EXCLUDED.total_generations,
  approved_count = EXCLUDED.approved_count,
  avg_quality_score = EXCLUDED.avg_quality_score,
  approval_rate = EXCLUDED.approval_rate,
  best_aspect_ratios = EXCLUDED.best_aspect_ratios,
  common_keywords = EXCLUDED.common_keywords,
  successful_patterns = EXCLUDED.successful_patterns,
  updated_at = EXCLUDED.updated_at;

-- 2. USER GLOBAL STATS
INSERT INTO public.user_global_stats (user_id, stats, created_at, updated_at)
VALUES 
('9a861d4b-a11f-45f7-8621-da407d7374aa', '{"textCalls": 0, "textTokens": 0, "gommoImages": 24, "totalImages": 260, "geminiImages": 236, "projectCount": 0, "promptTokens": 0, "resolution1K": 37, "resolution2K": 201, "resolution4K": 11, "candidateTokens": 0, "scenesGenerated": 249, "lastGenerationAt": "2026-01-09T11:12:37.653Z", "conceptsGenerated": 0, "firstGenerationAt": "2026-01-05T03:47:01.404Z", "productsGenerated": 0, "charactersGenerated": 11, "estimatedImagePromptTokens": 0}', '2026-01-05 03:46:59.69559+00', '2026-01-09 11:12:37.653+00'),
('e69583fc-27e8-4066-bdc5-8976ceaab1dd', '{"textCalls": 0, "textTokens": 0, "gommoImages": 0, "totalImages": 1, "geminiImages": 1, "projectCount": 0, "promptTokens": 0, "resolution1K": 0, "resolution2K": 0, "resolution4K": 0, "candidateTokens": 0, "scenesGenerated": 0, "lastGenerationAt": "2026-01-05T03:12:04.936Z", "conceptsGenerated": 0, "firstGenerationAt": "2026-01-05T03:12:04.936Z", "productsGenerated": 0, "charactersGenerated": 1, "estimatedImagePromptTokens": 0}', '2026-01-05 03:11:59.853263+00', '2026-01-05 03:12:04.936+00'),
('754b267d-e250-4bcf-bb0f-0a0f959f7d36', '{"textCalls": 0, "textTokens": 0, "gommoImages": 2, "totalImages": 25, "geminiImages": 23, "projectCount": 0, "promptTokens": 0, "resolution1K": 25, "resolution2K": 0, "resolution4K": 0, "candidateTokens": 0, "scenesGenerated": 25, "lastGenerationAt": "2026-01-06T04:21:43.832Z", "conceptsGenerated": 0, "firstGenerationAt": "2026-01-05T09:02:45.211Z", "productsGenerated": 0, "charactersGenerated": 0, "estimatedImagePromptTokens": 0}', '2026-01-05 03:29:45.946507+00', '2026-01-06 04:21:43.832+00'),
('698a1943-1765-47f5-9650-74c623f38d95', '{"textCalls": 0, "textTokens": 0, "gommoImages": 0, "totalImages": 135, "geminiImages": 135, "projectCount": 0, "promptTokens": 0, "resolution1K": 109, "resolution2K": 0, "resolution4K": 0, "candidateTokens": 0, "scenesGenerated": 109, "lastGenerationAt": "2026-01-13T07:52:51.828Z", "conceptsGenerated": 0, "firstGenerationAt": "2026-01-10T01:12:53.992Z", "productsGenerated": 0, "charactersGenerated": 26, "estimatedImagePromptTokens": 0}', '2026-01-07 03:21:31.383423+00', '2026-01-13 07:52:51.828+00'),
('00502df9-7596-4d9a-948c-2e6cd7d6ba67', '{"textCalls": 0, "textTokens": 0, "gommoImages": 0, "totalImages": 76, "geminiImages": 76, "projectCount": 0, "promptTokens": 0, "resolution1K": 69, "resolution2K": 0, "resolution4K": 0, "candidateTokens": 0, "scenesGenerated": 69, "lastGenerationAt": "2026-01-13T08:17:31.491Z", "conceptsGenerated": 0, "firstGenerationAt": "2026-01-10T10:12:55.331Z", "productsGenerated": 0, "charactersGenerated": 7, "estimatedImagePromptTokens": 0}', '2026-01-10 10:12:55.464702+00', '2026-01-13 08:17:31.491+00'),
('17fc8990-8bb7-4ed0-86c2-bbc4b47c5446', '{"textCalls": 0, "textTokens": 0, "gommoImages": 50, "totalImages": 358, "geminiImages": 308, "projectCount": 0, "promptTokens": 0, "resolution1K": 326, "resolution2K": 22, "resolution4K": 0, "candidateTokens": 0, "scenesGenerated": 348, "lastGenerationAt": "2026-01-13T10:00:08.301Z", "conceptsGenerated": 0, "firstGenerationAt": "2026-01-04T03:17:27.471Z", "productsGenerated": 0, "charactersGenerated": 10, "estimatedImagePromptTokens": 0}', '2026-01-04 03:17:27.656665+00', '2026-01-13 10:00:08.301+00'),
('d9913f27-cf07-4a17-94ce-df8f72ff1050', '{"textCalls": 0, "textTokens": 0, "gommoImages": 0, "totalImages": 2, "geminiImages": 2, "projectCount": 0, "promptTokens": 0, "resolution1K": 2, "resolution2K": 0, "resolution4K": 0, "candidateTokens": 0, "scenesGenerated": 2, "lastGenerationAt": "2026-01-13T10:48:20.918Z", "conceptsGenerated": 0, "firstGenerationAt": "2026-01-13T10:47:23.621Z", "productsGenerated": 0, "charactersGenerated": 0, "estimatedImagePromptTokens": 0}', '2026-01-13 10:47:23.680905+00', '2026-01-13 10:48:20.918+00'),
('adc2afa9-87c6-456c-9ac2-2fb8b71ecb3c', '{"textCalls": 0, "textTokens": 0, "gommoImages": 0, "totalImages": 29, "geminiImages": 29, "projectCount": 0, "promptTokens": 0, "resolution1K": 21, "resolution2K": 0, "resolution4K": 0, "candidateTokens": 0, "scenesGenerated": 21, "lastGenerationAt": "2026-01-13T10:53:46.386Z", "conceptsGenerated": 0, "firstGenerationAt": "2026-01-12T10:01:18.677Z", "productsGenerated": 0, "charactersGenerated": 8, "estimatedImagePromptTokens": 0}', '2026-01-04 03:51:39.141494+00', '2026-01-13 10:53:46.386+00'),
('aa2ac639-b8fc-4e6d-b433-5521582a36f2', '{"textCalls": 0, "textTokens": 0, "gommoImages": 0, "totalImages": 200, "geminiImages": 200, "projectCount": 0, "promptTokens": 0, "resolution1K": 193, "resolution2K": 0, "resolution4K": 0, "candidateTokens": 0, "scenesGenerated": 193, "lastGenerationAt": "2026-01-13T08:18:59.506Z", "conceptsGenerated": 0, "firstGenerationAt": "2026-01-05T09:03:02.883Z", "productsGenerated": 0, "charactersGenerated": 7, "estimatedImagePromptTokens": 0}', '2026-01-05 06:34:27.525527+00', '2026-01-13 08:18:59.506+00'),
('857abb3b-058a-4754-a0d9-6d1e9c46c19b', '{"textCalls": 0, "textTokens": 0, "gommoImages": 0, "totalImages": 278, "geminiImages": 278, "projectCount": 0, "promptTokens": 0, "resolution1K": 268, "resolution2K": 0, "resolution4K": 0, "candidateTokens": 0, "scenesGenerated": 268, "lastGenerationAt": "2026-01-13T02:43:18.928Z", "conceptsGenerated": 0, "firstGenerationAt": "2026-01-10T02:42:53.711Z", "productsGenerated": 0, "charactersGenerated": 10, "estimatedImagePromptTokens": 0}', '2026-01-10 02:42:55.511559+00', '2026-01-13 02:43:18.928+00'),
('6b8f9261-23ec-424b-b8a3-23a58f2a5e21', '{"textCalls": 0, "textTokens": 0, "gommoImages": 0, "totalImages": 68, "geminiImages": 68, "projectCount": 0, "promptTokens": 0, "resolution1K": 0, "resolution2K": 59, "resolution4K": 0, "candidateTokens": 0, "scenesGenerated": 59, "lastGenerationAt": "2026-01-12T11:08:29.558Z", "conceptsGenerated": 0, "firstGenerationAt": "2026-01-12T10:01:18.990Z", "productsGenerated": 0, "charactersGenerated": 9, "estimatedImagePromptTokens": 0}', '2026-01-12 02:54:34.718312+00', '2026-01-12 11:08:29.558+00')
ON CONFLICT (user_id) DO UPDATE SET
  stats = EXCLUDED.stats,
  updated_at = EXCLUDED.updated_at;

-- Re-enable triggers
ALTER TABLE public.dop_model_learnings ENABLE TRIGGER ALL;
ALTER TABLE public.user_global_stats ENABLE TRIGGER ALL;

SELECT 'IMPORT COMPLETE!' AS status;
