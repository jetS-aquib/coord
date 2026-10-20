# Lib Db

> 37 nodes

## Key Concepts

- **queries.ts** (50 connections) — `apps/iris/lib/db/queries.ts`
- **chat.ts** (39 connections) — `apps/iris/app/actions/chat.ts`
- **requireViewer()** (14 connections) — `apps/iris/app/actions/chat.ts`
- **assertChatMessageLength()** (12 connections) — `apps/iris/lib/chat/limits.ts`
- **createChatAction()** (11 connections) — `apps/iris/app/actions/chat.ts`
- **assertEveSessionOwnedByUser()** (8 connections) — `apps/iris/lib/db/eve-session.ts`
- **checkSendLimitAction()** (6 connections) — `apps/iris/app/actions/chat.ts`
- **deleteChatAction()** (6 connections) — `apps/iris/app/actions/chat.ts`
- **markChatPendingMessageAction()** (6 connections) — `apps/iris/app/actions/chat.ts`
- **createChat()** (6 connections) — `apps/iris/lib/db/queries.ts`
- **appendChatEventsAction()** (5 connections) — `apps/iris/app/actions/chat.ts`
- **clearChatPendingMessageAction()** (5 connections) — `apps/iris/app/actions/chat.ts`
- **renameChatAction()** (5 connections) — `apps/iris/app/actions/chat.ts`
- **saveChatSessionStateAction()** (5 connections) — `apps/iris/app/actions/chat.ts`
- **saveChatSnapshotAction()** (5 connections) — `apps/iris/app/actions/chat.ts`
- **setChatStarredAction()** (5 connections) — `apps/iris/app/actions/chat.ts`
- **skipChatAuthorizationAction()** (5 connections) — `apps/iris/app/actions/chat.ts`
- **checkChatSendLimit()** (4 connections) — `apps/iris/lib/chat/send-limit.ts`
- **appendChatEvent()** (4 connections) — `apps/iris/lib/db/queries.ts`
- **appendChatEvents()** (4 connections) — `apps/iris/lib/db/queries.ts`
- **listChatsByUser()** (4 connections) — `apps/iris/lib/db/queries.ts`
- **markChatPendingMessage()** (4 connections) — `apps/iris/lib/db/queries.ts`
- **saveChatSessionState()** (4 connections) — `apps/iris/lib/db/queries.ts`
- **saveChatSnapshot()** (4 connections) — `apps/iris/lib/db/queries.ts`
- **skipChatAuthorization()** (4 connections) — `apps/iris/lib/db/queries.ts`
- *... and 12 more nodes in this community*

## Relationships

- [App Components](App_Components.md) (29 shared connections)
- [Core API Routes](Core_API_Routes.md) (15 shared connections)
- [Lib Db](Lib_Db.md) (13 shared connections)
- [Lib Chat](Lib_Chat.md) (9 shared connections)
- [Rollstock Audio Generation](Rollstock_Audio_Generation.md) (6 shared connections)
- [Lib Projects](Lib_Projects.md) (5 shared connections)
- [Project Memory And Notes](Project_Memory_And_Notes.md) (3 shared connections)
- [Atlas Features And Search](Atlas_Features_And_Search.md) (3 shared connections)
- [Agent Tools](Agent_Tools.md) (2 shared connections)
- [Chat Shell Skeletons](Chat_Shell_Skeletons.md) (2 shared connections)
- [Lib Rollstock](Lib_Rollstock.md) (2 shared connections)
- [Atlas Copilot](Atlas_Copilot.md) (1 shared connections)

## Source Files

- `apps/iris/app/actions/chat.ts`
- `apps/iris/lib/chat/limits.ts`
- `apps/iris/lib/chat/send-limit.ts`
- `apps/iris/lib/db/eve-session.ts`
- `apps/iris/lib/db/queries.ts`

## Audit Trail

- EXTRACTED: 172 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*