--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: dop_model_learnings; Type: TABLE DATA; Schema: public; Owner: -
--

SET SESSION AUTHORIZATION DEFAULT;

ALTER TABLE public.dop_model_learnings DISABLE TRIGGER ALL;

INSERT INTO public.dop_model_learnings VALUES ('b6a66268-b1a1-41de-8c56-916c812aac2d', 'midjourney', 2, 0, 0, 0, '{}', '{}', '{}', '2026-01-05 08:02:06.733+00', '{}', '{}');
INSERT INTO public.dop_model_learnings VALUES ('093265b8-0870-4d21-9e59-fb4d2d96b27a', 'gemini', 1000, 66, 0.7969697, 0.066, '{"16:9": 66}', '{"8k": 66, "anime": 66, "sharp": 7, "cartoon": 66, "detailed": 66, "dramatic": 66, "lighting": 66, "cinematic": 66, "full body": 34, "landscape": 66, "realistic": 66, "head to toe": 66, "masterpiece": 66, "illustration": 66, "photorealistic": 66}', '{cinematic,realistic,8k,detailed,lighting,landscape,masterpiece,anime,cartoon,illustration,photorealistic,dramatic,"head to toe","full body",sharp}', '2026-01-13 10:53:27.58+00', '{}', '{}');
INSERT INTO public.dop_model_learnings VALUES ('4a769ce3-42d7-4e6d-89e3-2723b80b7dd7', 'seedream', 27, 2, 0.95, 0.074074075, '{"16:9": 2}', '{"sharp": 1, "cinematic": 2, "realistic": 2, "masterpiece": 2, "photorealistic": 2}', '{cinematic,realistic,masterpiece,photorealistic,sharp}', '2026-01-05 07:09:47.543+00', '{}', '{}');
INSERT INTO public.dop_model_learnings VALUES ('a7e9cfb0-84fe-47e3-8a03-ebc6508b313d', 'kling', 2, 0, 0, 0, '{}', '{}', '{}', '2026-01-05 07:23:34.541+00', '{}', '{}');


ALTER TABLE public.dop_model_learnings ENABLE TRIGGER ALL;

--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.profiles DISABLE TRIGGER ALL;

INSERT INTO public.profiles VALUES ('f9a95808-fc0f-474b-aac4-bdbce9214814', '', 'pro', '2025-12-24 06:22:46.471095+00', 'sonicvn30091@gmail.com', '2025-12-26 06:22:46.471095+00', NULL, NULL, '{"1K": 0, "2K": 0, "4K": 0, "total": 0, "scenes": 0, "concepts": 0, "products": 0, "characters": 0}', 'user', NULL, '2026-01-04 05:35:02.673455+00');
INSERT INTO public.profiles VALUES ('db0025e6-565e-4d61-975a-fce970a822e4', 'Le Dang', 'pro', '2026-01-04 06:10:57.320326+00', 'ledang@gmail.com', NULL, NULL, NULL, '{"1K": 0, "2K": 0, "4K": 0, "total": 0, "scenes": 0, "concepts": 0, "products": 0, "characters": 0}', 'user', NULL, '2026-01-04 06:10:57.320326+00');
INSERT INTO public.profiles VALUES ('754b267d-e250-4bcf-bb0f-0a0f959f7d36', 'Nguyen Van Hai', 'pro', '2025-12-31 02:44:56.330731+00', 'hai42@gmail.com', NULL, NULL, 'AIzaSyCtY-gT_yBRhaI-_mCBJsg2gPpikxZSXLg', '{"1K": 25, "2K": 0, "4K": 0, "total": 25, "scenes": 25, "concepts": 0, "products": 0, "textCalls": 0, "characters": 0, "textTokens": 0, "gommoImages": 2, "geminiImages": 23, "promptTokens": 0, "candidateTokens": 0, "lastGeneratedAt": "2026-01-06T04:21:43.370Z", "estimatedPromptTokens": 4395}', 'user', NULL, '2026-01-04 05:35:02.673455+00');
INSERT INTO public.profiles VALUES ('aa2ac639-b8fc-4e6d-b433-5521582a36f2', 'phạm ngọc bảo', 'pro', '2026-01-03 07:15:29.048564+00', 'pbao08@gmail.com', NULL, NULL, NULL, '{"1K": 9, "2K": 0, "4K": 0, "total": 16, "scenes": 9, "characters": 7, "gommoImages": 0, "geminiImages": 9, "lastGeneratedAt": "2026-01-13T08:18:58.711Z", "estimatedPromptTokens": 20249}', 'user', NULL, '2026-01-04 05:35:02.673455+00');
INSERT INTO public.profiles VALUES ('ef85ef2a-6465-4b37-b921-fc2ff55ce947', NULL, 'pro', '2025-12-24 06:18:19.782269+00', 'dangitaudit@gmail.com', NULL, NULL, NULL, '{"1K": 0, "2K": 0, "4K": 0, "total": 0, "scenes": 0, "concepts": 0, "products": 0, "characters": 0}', 'user', NULL, '2026-01-04 05:35:02.673455+00');
INSERT INTO public.profiles VALUES ('6b8f9261-23ec-424b-b8a3-23a58f2a5e21', '', 'pro', '2025-12-24 09:04:48.373646+00', 'minhhai.kt15@gmail.com', NULL, NULL, NULL, '{"1K": 0, "2K": 60, "4K": 0, "total": 94, "scenes": 60, "concepts": 0, "products": 25, "characters": 9, "gommoImages": 0, "geminiImages": 60, "lastGeneratedAt": "2026-01-12T11:08:28.442Z", "estimatedPromptTokens": 70825}', 'user', NULL, '2026-01-04 05:35:02.673455+00');
INSERT INTO public.profiles VALUES ('b2ba8e55-5512-41ce-82f6-c2ed8014ff1f', 'mr Sonic30', 'pro', '2025-12-24 11:29:28.432564+00', 'tesss@gmail.com', NULL, NULL, NULL, '{"1K": 0, "2K": 0, "4K": 0, "total": 0, "scenes": 0, "concepts": 0, "products": 0, "characters": 0}', 'user', NULL, '2026-01-04 05:35:02.673455+00');
INSERT INTO public.profiles VALUES ('6694d7bc-9e77-4899-8163-5037fc2fc8c7', NULL, 'free', '2025-12-24 04:50:46.979484+00', 'test@example.com', NULL, NULL, NULL, '{"1K": 0, "2K": 0, "4K": 0, "total": 0, "scenes": 0, "concepts": 0, "products": 0, "characters": 0}', 'deleted', '[Deleted User]', '2026-01-04 05:35:02.673455+00');
INSERT INTO public.profiles VALUES ('0f2c4e69-1692-4b71-8cb0-b7976fc6cff3', '', 'pro', '2025-12-24 06:46:01.664465+00', 'tes@gmail.com', NULL, NULL, '', '{"1K": 0, "2K": 0, "4K": 0, "total": 0, "scenes": 0, "concepts": 0, "products": 0, "characters": 0}', 'deleted', '[Deleted User]', '2026-01-04 05:35:02.673455+00');
INSERT INTO public.profiles VALUES ('c7fae5ca-9939-4dee-b89c-50e7dad99644', '', 'free', '2025-12-24 07:27:50.006181+00', 'sonic@gmail.com', NULL, NULL, NULL, '{"1K": 0, "2K": 0, "4K": 0, "total": 0, "scenes": 0, "concepts": 0, "products": 0, "characters": 0}', 'deleted', '[Deleted User]', '2026-01-04 05:35:02.673455+00');
INSERT INTO public.profiles VALUES ('bdbe7461-11ef-4283-a3c9-743a00476a0f', '', 'free', '2025-12-24 07:36:42.262121+00', 'dandd150392@gmail.com', NULL, NULL, NULL, '{"1K": 0, "2K": 0, "4K": 0, "total": 0, "scenes": 0, "concepts": 0, "products": 0, "characters": 0}', 'deleted', '[Deleted User]', '2026-01-04 05:35:02.673455+00');
INSERT INTO public.profiles VALUES ('adc2afa9-87c6-456c-9ac2-2fb8b71ecb3c', 'Nguyen Van Bao', 'pro', '2025-12-31 02:44:11.750679+00', 'bao42@gmail.com', NULL, NULL, 'AIzaSyCtY-gT_yBRhaI-_mCBJsg2gPpikxZSXLg', '{"1K": 21, "2K": 0, "4K": 0, "total": 29, "scenes": 21, "concepts": 0, "products": 0, "textCalls": 0, "characters": 8, "textTokens": 0, "gommoImages": 0, "geminiImages": 29, "promptTokens": 0, "candidateTokens": 0, "lastGeneratedAt": "2026-01-13T10:53:45.718Z", "estimatedPromptTokens": 2519}', 'user', NULL, '2026-01-04 05:35:02.673455+00');
INSERT INTO public.profiles VALUES ('cc478875-9d0f-4cf7-9b4a-3bd934ab7caa', 'Trung chi', 'pro', '2025-12-31 05:17:26.182536+00', 'trungchi01@gmail.com', NULL, NULL, 'AIzaSyCDUNjknqC4si7Y7QtqGJfDJviZmwsiWLY', '{"1K": 0, "2K": 0, "4K": 0, "total": 0, "scenes": 0, "concepts": 0, "products": 0, "characters": 0}', 'user', NULL, '2026-01-04 05:35:02.673455+00');
INSERT INTO public.profiles VALUES ('f740e61e-774f-4184-a683-8400a539ccab', 'Mrsonic30', 'pro', '2025-12-24 11:11:11.023691+00', 'xvirion1@gmail.com', NULL, NULL, NULL, '{"1K": 0, "2K": 0, "4K": 0, "total": 0, "scenes": 0, "concepts": 0, "products": 0, "characters": 0}', 'deleted', '[Deleted User]', '2026-01-04 05:35:02.673455+00');
INSERT INTO public.profiles VALUES ('195eaff9-f381-45e6-85bc-c5c3219fd619', 'Le dang', 'pro', '2025-12-31 05:14:07.360404+00', 'xvirion11@gmail.com', NULL, NULL, NULL, '{"1K": 0, "2K": 0, "4K": 0, "total": 0, "scenes": 0, "concepts": 0, "products": 0, "characters": 0}', 'deleted', '[Deleted User]', '2026-01-04 05:35:02.673455+00');
INSERT INTO public.profiles VALUES ('17fc8990-8bb7-4ed0-86c2-bbc4b47c5446', NULL, 'pro', '2025-12-24 04:43:54.502032+00', 'xvirion@gmail.com', NULL, NULL, NULL, '{"1K": 5, "2K": 0, "4K": 0, "total": 5, "scenes": 5, "gommoImages": 0, "geminiImages": 5, "lastGeneratedAt": "2026-01-13T10:00:07.678Z", "estimatedPromptTokens": 10059}', 'admin', NULL, '2026-01-04 05:35:02.673455+00');
INSERT INTO public.profiles VALUES ('a635ceba-9951-48cc-9146-77a63e2f4466', 'Henry', 'pro', '2026-01-13 10:29:49.740992+00', 'henry1@gmail.com', NULL, NULL, NULL, '{"1K": 0, "2K": 0, "4K": 0, "total": 0, "scenes": 0, "concepts": 0, "products": 0, "characters": 0}', 'user', NULL, '2026-01-13 10:29:49.740992+00');
INSERT INTO public.profiles VALUES ('857abb3b-058a-4754-a0d9-6d1e9c46c19b', 'PHAN VAN SIEU', 'pro', '2026-01-10 01:46:06.073954+00', 'phanvansieu2k@gmail.com', NULL, NULL, NULL, '{"1K": 251, "2K": 0, "4K": 0, "total": 259, "scenes": 251, "concepts": 0, "products": 0, "textCalls": 0, "characters": 8, "textTokens": 0, "gommoImages": 0, "geminiImages": 251, "promptTokens": 0, "candidateTokens": 0, "lastGeneratedAt": "2026-01-13T02:43:17.571Z", "estimatedPromptTokens": 57947}', 'user', NULL, '2026-01-10 01:46:06.073954+00');
INSERT INTO public.profiles VALUES ('00502df9-7596-4d9a-948c-2e6cd7d6ba67', 'tuấn phạm', 'pro', '2026-01-10 01:48:26.407284+00', 'clone99990@gmail.com', NULL, NULL, NULL, '{"1K": 232, "2K": 0, "4K": 0, "total": 241, "scenes": 232, "concepts": 0, "products": 0, "textCalls": 0, "characters": 9, "textTokens": 0, "gommoImages": 0, "geminiImages": 232, "promptTokens": 0, "candidateTokens": 0, "lastGeneratedAt": "2026-01-13T08:17:30.708Z", "estimatedPromptTokens": 15262}', 'user', NULL, '2026-01-10 01:48:26.407284+00');
INSERT INTO public.profiles VALUES ('64cff5c6-ac93-4c61-af09-abd55d6f91d9', 'Trần Ngọc Anh Huy', 'pro', '2026-01-13 04:17:59.345699+00', 'huytran160197@gmail.com', NULL, NULL, NULL, '{"1K": 0, "2K": 0, "4K": 0, "total": 0, "scenes": 0, "concepts": 0, "products": 0, "characters": 0}', 'user', NULL, '2026-01-13 04:17:59.345699+00');
INSERT INTO public.profiles VALUES ('d9913f27-cf07-4a17-94ce-df8f72ff1050', 'tuấn phạm', 'pro', '2026-01-13 08:57:40.824213+00', 'clone66660@gmail.com', NULL, NULL, NULL, '{"1K": 2, "2K": 0, "4K": 0, "total": 2, "scenes": 2, "concepts": 0, "products": 0, "characters": 0, "gommoImages": 0, "geminiImages": 2, "lastGeneratedAt": "2026-01-13T10:48:19.564Z", "estimatedPromptTokens": 4355}', 'user', NULL, '2026-01-13 08:57:40.824213+00');
INSERT INTO public.profiles VALUES ('698a1943-1765-47f5-9650-74c623f38d95', 'Hai', 'pro', '2026-01-06 06:13:13.257068+00', 'hai01@gmail.com', NULL, NULL, NULL, '{"1K": 109, "2K": 0, "4K": 0, "total": 135, "scenes": 109, "concepts": 0, "products": 0, "textCalls": 0, "characters": 26, "textTokens": 0, "gommoImages": 0, "geminiImages": 119, "promptTokens": 0, "candidateTokens": 0, "lastGeneratedAt": "2026-01-13T07:52:51.365Z", "estimatedPromptTokens": 15329}', 'user', NULL, '2026-01-06 06:13:13.257068+00');
INSERT INTO public.profiles VALUES ('e69583fc-27e8-4066-bdc5-8976ceaab1dd', 'Quốc Anh', 'pro', '2026-01-05 03:08:55.908752+00', 'sp01@gmail.com', NULL, NULL, NULL, '{"1K": 0, "2K": 0, "4K": 0, "total": 1, "scenes": 0, "concepts": 0, "products": 0, "characters": 1, "lastGeneratedAt": "2026-01-05T03:12:04.330Z"}', 'user', NULL, '2026-01-05 03:08:55.908752+00');
INSERT INTO public.profiles VALUES ('9a861d4b-a11f-45f7-8621-da407d7374aa', 'Bi Hoàng', 'pro', '2025-12-26 04:13:34.394666+00', 'bihoang995@gmail.com', NULL, NULL, NULL, '{"1K": 37, "2K": 201, "4K": 11, "total": 269, "scenes": 249, "concepts": 0, "products": 9, "textCalls": 0, "characters": 11, "textTokens": 0, "gommoImages": 24, "geminiImages": 236, "promptTokens": 0, "candidateTokens": 0, "lastGeneratedAt": "2026-01-12T11:52:35.033Z", "estimatedPromptTokens": 0}', 'user', NULL, '2026-01-04 05:35:02.673455+00');


ALTER TABLE public.profiles ENABLE TRIGGER ALL;

--
-- Data for Name: user_global_stats; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.user_global_stats DISABLE TRIGGER ALL;

INSERT INTO public.user_global_stats VALUES ('9a861d4b-a11f-45f7-8621-da407d7374aa', '{"textCalls": 0, "textTokens": 0, "gommoImages": 24, "totalImages": 260, "geminiImages": 236, "projectCount": 0, "promptTokens": 0, "resolution1K": 37, "resolution2K": 201, "resolution4K": 11, "candidateTokens": 0, "scenesGenerated": 249, "lastGenerationAt": "2026-01-09T11:12:37.653Z", "conceptsGenerated": 0, "firstGenerationAt": "2026-01-05T03:47:01.404Z", "productsGenerated": 0, "charactersGenerated": 11, "estimatedImagePromptTokens": 0}', '2026-01-05 03:46:59.69559+00', '2026-01-09 11:12:37.653+00');
INSERT INTO public.user_global_stats VALUES ('e69583fc-27e8-4066-bdc5-8976ceaab1dd', '{"textCalls": 0, "textTokens": 0, "gommoImages": 0, "totalImages": 1, "geminiImages": 1, "projectCount": 0, "promptTokens": 0, "resolution1K": 0, "resolution2K": 0, "resolution4K": 0, "candidateTokens": 0, "scenesGenerated": 0, "lastGenerationAt": "2026-01-05T03:12:04.936Z", "conceptsGenerated": 0, "firstGenerationAt": "2026-01-05T03:12:04.936Z", "productsGenerated": 0, "charactersGenerated": 1, "estimatedImagePromptTokens": 0}', '2026-01-05 03:11:59.853263+00', '2026-01-05 03:12:04.936+00');
INSERT INTO public.user_global_stats VALUES ('754b267d-e250-4bcf-bb0f-0a0f959f7d36', '{"textCalls": 0, "textTokens": 0, "gommoImages": 2, "totalImages": 25, "geminiImages": 23, "projectCount": 0, "promptTokens": 0, "resolution1K": 25, "resolution2K": 0, "resolution4K": 0, "candidateTokens": 0, "scenesGenerated": 25, "lastGenerationAt": "2026-01-06T04:21:43.832Z", "conceptsGenerated": 0, "firstGenerationAt": "2026-01-05T09:02:45.211Z", "productsGenerated": 0, "charactersGenerated": 0, "estimatedImagePromptTokens": 0}', '2026-01-05 03:29:45.946507+00', '2026-01-06 04:21:43.832+00');
INSERT INTO public.user_global_stats VALUES ('698a1943-1765-47f5-9650-74c623f38d95', '{"textCalls": 0, "textTokens": 0, "gommoImages": 0, "totalImages": 135, "geminiImages": 135, "projectCount": 0, "promptTokens": 0, "resolution1K": 109, "resolution2K": 0, "resolution4K": 0, "candidateTokens": 0, "scenesGenerated": 109, "lastGenerationAt": "2026-01-13T07:52:51.828Z", "conceptsGenerated": 0, "firstGenerationAt": "2026-01-10T01:12:53.992Z", "productsGenerated": 0, "charactersGenerated": 26, "estimatedImagePromptTokens": 0}', '2026-01-07 03:21:31.383423+00', '2026-01-13 07:52:51.828+00');
INSERT INTO public.user_global_stats VALUES ('00502df9-7596-4d9a-948c-2e6cd7d6ba67', '{"textCalls": 0, "textTokens": 0, "gommoImages": 0, "totalImages": 76, "geminiImages": 76, "projectCount": 0, "promptTokens": 0, "resolution1K": 69, "resolution2K": 0, "resolution4K": 0, "candidateTokens": 0, "scenesGenerated": 69, "lastGenerationAt": "2026-01-13T08:17:31.491Z", "conceptsGenerated": 0, "firstGenerationAt": "2026-01-10T10:12:55.331Z", "productsGenerated": 0, "charactersGenerated": 7, "estimatedImagePromptTokens": 0}', '2026-01-10 10:12:55.464702+00', '2026-01-13 08:17:31.491+00');
INSERT INTO public.user_global_stats VALUES ('17fc8990-8bb7-4ed0-86c2-bbc4b47c5446', '{"textCalls": 0, "textTokens": 0, "gommoImages": 50, "totalImages": 358, "geminiImages": 308, "projectCount": 0, "promptTokens": 0, "resolution1K": 326, "resolution2K": 22, "resolution4K": 0, "candidateTokens": 0, "scenesGenerated": 348, "lastGenerationAt": "2026-01-13T10:00:08.301Z", "conceptsGenerated": 0, "firstGenerationAt": "2026-01-04T03:17:27.471Z", "productsGenerated": 0, "charactersGenerated": 10, "estimatedImagePromptTokens": 0}', '2026-01-04 03:17:27.656665+00', '2026-01-13 10:00:08.301+00');
INSERT INTO public.user_global_stats VALUES ('d9913f27-cf07-4a17-94ce-df8f72ff1050', '{"textCalls": 0, "textTokens": 0, "gommoImages": 0, "totalImages": 2, "geminiImages": 2, "projectCount": 0, "promptTokens": 0, "resolution1K": 2, "resolution2K": 0, "resolution4K": 0, "candidateTokens": 0, "scenesGenerated": 2, "lastGenerationAt": "2026-01-13T10:48:20.918Z", "conceptsGenerated": 0, "firstGenerationAt": "2026-01-13T10:47:23.621Z", "productsGenerated": 0, "charactersGenerated": 0, "estimatedImagePromptTokens": 0}', '2026-01-13 10:47:23.680905+00', '2026-01-13 10:48:20.918+00');
INSERT INTO public.user_global_stats VALUES ('adc2afa9-87c6-456c-9ac2-2fb8b71ecb3c', '{"textCalls": 0, "textTokens": 0, "gommoImages": 0, "totalImages": 29, "geminiImages": 29, "projectCount": 0, "promptTokens": 0, "resolution1K": 21, "resolution2K": 0, "resolution4K": 0, "candidateTokens": 0, "scenesGenerated": 21, "lastGenerationAt": "2026-01-13T10:53:46.386Z", "conceptsGenerated": 0, "firstGenerationAt": "2026-01-12T10:01:18.677Z", "productsGenerated": 0, "charactersGenerated": 8, "estimatedImagePromptTokens": 0}', '2026-01-04 03:51:39.141494+00', '2026-01-13 10:53:46.386+00');
INSERT INTO public.user_global_stats VALUES ('aa2ac639-b8fc-4e6d-b433-5521582a36f2', '{"textCalls": 0, "textTokens": 0, "gommoImages": 0, "totalImages": 200, "geminiImages": 200, "projectCount": 0, "promptTokens": 0, "resolution1K": 193, "resolution2K": 0, "resolution4K": 0, "candidateTokens": 0, "scenesGenerated": 193, "lastGenerationAt": "2026-01-13T08:18:59.506Z", "conceptsGenerated": 0, "firstGenerationAt": "2026-01-05T09:03:02.883Z", "productsGenerated": 0, "charactersGenerated": 7, "estimatedImagePromptTokens": 0}', '2026-01-05 06:34:27.525527+00', '2026-01-13 08:18:59.506+00');
INSERT INTO public.user_global_stats VALUES ('857abb3b-058a-4754-a0d9-6d1e9c46c19b', '{"textCalls": 0, "textTokens": 0, "gommoImages": 0, "totalImages": 278, "geminiImages": 278, "projectCount": 0, "promptTokens": 0, "resolution1K": 268, "resolution2K": 0, "resolution4K": 0, "candidateTokens": 0, "scenesGenerated": 268, "lastGenerationAt": "2026-01-13T02:43:18.928Z", "conceptsGenerated": 0, "firstGenerationAt": "2026-01-10T02:42:53.711Z", "productsGenerated": 0, "charactersGenerated": 10, "estimatedImagePromptTokens": 0}', '2026-01-10 02:42:55.511559+00', '2026-01-13 02:43:18.928+00');
INSERT INTO public.user_global_stats VALUES ('6b8f9261-23ec-424b-b8a3-23a58f2a5e21', '{"textCalls": 0, "textTokens": 0, "gommoImages": 0, "totalImages": 68, "geminiImages": 68, "projectCount": 0, "promptTokens": 0, "resolution1K": 0, "resolution2K": 59, "resolution4K": 0, "candidateTokens": 0, "scenesGenerated": 59, "lastGenerationAt": "2026-01-12T11:08:29.558Z", "conceptsGenerated": 0, "firstGenerationAt": "2026-01-12T10:01:18.990Z", "productsGenerated": 0, "charactersGenerated": 9, "estimatedImagePromptTokens": 0}', '2026-01-12 02:54:34.718312+00', '2026-01-12 11:08:29.558+00');


ALTER TABLE public.user_global_stats ENABLE TRIGGER ALL;

--
-- PostgreSQL database dump complete
--


