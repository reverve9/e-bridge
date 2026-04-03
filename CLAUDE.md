# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

E-Bridge is a Korean local election candidate information platform (지방선거 후보자 정보 플랫폼) for the June 3, 2026 nationwide local elections. All UI text is in Korean.

## Monorepo Structure

Turborepo monorepo with npm workspaces. Three apps share code via internal packages:

- **apps/super-admin** — Admin dashboard for managing all candidates and election data
- **apps/candidate-admin** — Dashboard for individual candidates to manage their profiles/content (PWA)
- **apps/voter-app** — Public-facing voter information platform (PWA)
- **packages/shared** (`@e-bridge/shared`) — Shared constants: party definitions, election types
- **packages/ui** (`@e-bridge/ui`) — Reusable UI components with party-based theme system
- **packages/supabase** (`@e-bridge/supabase`) — Supabase client init and generated DB types

## Commands

```bash
# Development (run individual apps)
npm run dev:super-admin
npm run dev:candidate-admin
npm run dev:voter-app

# Build all apps
npm run build

# Lint all apps
npm run lint

# Run turbo for a specific app
npx turbo run build --filter=super-admin
npx turbo run lint --filter=candidate-admin
```

## Tech Stack

- **Framework:** React 18 + TypeScript 5.3 + Vite 5
- **Styling:** Tailwind CSS 3.3
- **Routing:** React Router DOM 6
- **Backend:** Supabase (PostgreSQL + JS client, no ORM)
- **Icons:** lucide-react
- **Animation:** framer-motion (candidate-admin, voter-app)
- **PWA:** vite-plugin-pwa (candidate-admin, voter-app)
- **Deployment:** Vercel (each app is a separate Vercel project)

## Architecture

### Theme System
Party-based theming with three modes: classic, colorful, dark. Defined in `packages/ui/src/theme.ts` and `packages/ui/src/themes.ts`. Uses React Context (`ThemeProvider` + `useTheme()` hook from `packages/ui/src/ThemeContext.tsx`). Three party themes: 더불어민주당 (dmj), 국민의힘 (ppp), 무소속 (ind) — each with primary, primaryLight, primaryDark, secondary, accent colors.

- **더불어민주당 primary:** `#0033FF` (CMYK 100 80 0 0)
- **정당 에셋:** `packages/ui/src/assets/` — `header-tmj.png` (헤더 배경), `logo-tmj.png` (로고)
- **HeaderStyle:** `background`, `textColor`, `iconBgColor`, `logoUrl?` (에셋 로고 우선, 없으면 DB party_logo_url fallback)

### SMS Landing Page
- **DB 테이블:** `sms_landings` — 문자 랜딩페이지 데이터 (greeting, body, closing, selected_pledge_ids, sections, slide_images)
- **candidate-admin:** `SmsTab.tsx` — 문자 작성 + 섹션 선택 + 실시간 미리보기 + 랜딩페이지 생성
- **voter-app:** `SmsLandingPage.tsx` — `/:partyCode/:candidateCode/:landingId` 라우트
- **이브릿지 섹션:** `LANDING_SECTIONS` 상수 배열 (profile, intro, pledges, gallery, feeds, cheers, contact) — 기존 유권자앱 데이터를 가져옴
- **이미지 슬라이드:** 문자 전용 섹션, 최대 6장, `candidates` 버킷 `sms-slides/` 폴더에 저장, `sms_landings.slide_images` text[] 컬럼
  - 5초 자동 슬라이드 + 좌우 스와이프/버튼 + 도트 인디케이터
  - 독립 토글로 ON/OFF, 이브릿지 섹션과 분리
- **콘텐츠 순서:** `sections` 필드에 `sms_content`, `sms_images`, 이브릿지 섹션 키를 통합 저장하여 표시 순서 관리
  - `sms_content` — 문자 내용(인사말/본문/마무리), 항상 포함
  - `sms_images` — 이미지 슬라이드, 토글 ON 시 포함
  - 기존 데이터 하위 호환: `sms_content` 없으면 자동으로 최상단 배치
- **본문 더보기:** 15줄 초과 시 잘림 + `...` + 더보기/접기 버튼 (미리보기 동일 적용)
- **마크다운 지원:** 인사말/본문/마무리 필드에 #/##/###, **bold**, *italic*, ~~strikethrough~~, [link](url), - list, 1. list, > quote
- 새 랜딩페이지 생성 시 이전 것 자동 삭제 (후보자당 1개)

### Database Schema (Supabase)
Key tables: `candidates`, `profiles`, `pledges`, `sns_links`, `news`, `sms_landings`, `feeds`, `cheers`, `page_visits`. Types are generated in `packages/supabase/types.ts`.

### Candidate Images
- `photo_url` — 대표 이미지 (16:9, 히어로 갤러리)
- `thumbnail_url` — 썸네일 (1:1, 목록/검색/랜딩 헤더에서 우선 사용)
- `name_image_url` — 이름 이미지 (히어로 하단, 투명 PNG, 없으면 텍스트 fallback)
- `gallery_images[]` — 갤러리 슬라이드 (최대 2장)

### Authentication
Simple localStorage-based sessions:
- super-admin: `localStorage 'super-admin-auth'`
- candidate-admin: `localStorage 'candidate-id'`
- voter-app: no auth (public)

### Path Aliases
All apps use `@/*` → `src/*` via both tsconfig paths and Vite resolve alias.

### CandidatePage (voter-app) Layout
히어로(갤러리 슬라이드) → 이름 이미지/텍스트 → 슬로건 바(정당 컬러) → 태그라인 → 프로필/인사말 탭 → 핵심공약(기본 5개) → 최근소식 → 응원메시지 → 같은당 후보(없으면 숨김) → D-Day → 연락사무소 → 면책문구((주)브릿지나인)

### Supabase Edge Functions
`supabase/functions/generate-summary/` — AI-powered news summary generation.

### Environment Variables
Each app has its own `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. See `apps/super-admin/.env.example` for reference.
