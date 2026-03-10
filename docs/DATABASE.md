# FlowQueue – Database Schema

## Overview

The database uses **PostgreSQL** managed through **Prisma ORM**.

---

## Tables

### `User`
Core identity for every person in the system.

| Column | Type | Description |
|--------|------|-------------|
| id | String (cuid) | Primary key |
| email | String (unique) | Login email |
| password | String | bcrypt hash |
| name | String | Display name |
| role | UserRole | OWNER / MANAGEMENT / WORKER / CLIENT |
| isActive | Boolean | Soft disable |
| createdAt | DateTime | — |
| updatedAt | DateTime | — |

---

### `ClientProfile`
Extended data for CLIENT users.

| Column | Type | Description |
|--------|------|-------------|
| userId | String (FK) | → User.id |
| freeProjectsUsed | Int | How many free slots consumed |
| freeProjectsLimit | Int | Default 3 |
| company | String? | Optional company name |
| phone | String? | Contact number |

**Free tier logic:**
- New clients start with `freeProjectsUsed = 0`, `freeProjectsLimit = 3`.
- When a non-SIMPLE project is submitted AND `freeProjectsUsed < freeProjectsLimit`, the `isFree` flag is set to `true` on the project and `freeProjectsUsed` is incremented.
- If the project is **rejected**, `freeProjectsUsed` is decremented to refund the slot.

---

### `WorkerProfile`
Extended data for WORKER users.

| Column | Type | Description |
|--------|------|-------------|
| userId | String (FK) | → User.id |
| skills | String[] | e.g. ["react", "nodejs"] |
| availability | Boolean | Currently available |
| bio | String? | Short bio |
| hourlyRate | Float? | USD/hour |

---

### `ManagementProfile`
Extended data for MANAGEMENT users.

| Column | Type | Description |
|--------|------|-------------|
| userId | String (FK) | → User.id |
| department | String? | e.g. "Operations" |
| permissions | String[] | Fine-grained permission list |

---

### `Project`
Central entity of the platform.

| Column | Type | Description |
|--------|------|-------------|
| id | String (cuid) | Primary key |
| title | String | Project title |
| description | String | Detailed description |
| category | String | e.g. "Web Development" |
| tier | ProjectTier | SIMPLE / STANDARD / PREMIUM / ENTERPRISE |
| status | ProjectStatus | See workflow below |
| priority | Priority | LOW / NORMAL / HIGH / URGENT |
| isFree | Boolean | Will not be invoiced |
| queuePosition | Int? | Assigned on approval |
| estimatedStartDate | DateTime? | Computed from queue position |
| submittedAt | DateTime? | When client submitted |
| submittedById | String? (FK) | → User.id (client) |
| reviewedAt | DateTime? | When owner reviewed |
| reviewedById | String? (FK) | → User.id (owner) |
| rejectionReason | String? | Set on rejection |
| approvalNotes | String? | Set on approval |
| assignedWorkerId | String? (FK) | → User.id (worker) |
| budget | Float? | Client budget in USD |
| deadline | DateTime? | Requested deadline |
| deliverables | String? | Expected outputs |

---

### `Message`
Messages between users, optionally tied to a project.

| Column | Type | Description |
|--------|------|-------------|
| senderId | String (FK) | → User.id |
| receiverId | String (FK) | → User.id |
| projectId | String? (FK) | → Project.id |
| content | String | Message body |
| isInternal | Boolean | Staff-only flag |

---

### `Notification`
In-app notifications.

| Column | Type | Description |
|--------|------|-------------|
| userId | String (FK) | → User.id (recipient) |
| projectId | String? (FK) | → Project.id |
| type | NotificationType | Enum |
| title | String | Short title |
| message | String | Full message body |
| isRead | Boolean | Read status |

---

## Approval Workflow

```
DRAFT ──► SUBMITTED ──► APPROVED ──► IN_QUEUE ──► IN_PROGRESS ──► COMPLETED
                   │
                   └──► REJECTED
```

1. Client saves a draft → status = `DRAFT`
2. Client submits → status = `SUBMITTED`, `submittedAt` = now
3. **Admin approves** → status = `APPROVED`, `queuePosition` assigned, `estimatedStartDate` calculated
4. **Admin rejects** → status = `REJECTED`, `rejectionReason` saved, free slot refunded if applicable
5. Management assigns worker → status = `IN_QUEUE`
6. Work begins → status = `IN_PROGRESS`
7. Work complete → status = `COMPLETED`

---

## Relationships Diagram (simplified)

```
User ──1:1──► ClientProfile
User ──1:1──► WorkerProfile
User ──1:1──► ManagementProfile

User ──1:N──► Project (submitted)
User ──1:N──► Project (reviewed)
User ──1:N──► Project (assigned)

Project ──1:N──► Message
Project ──1:N──► Notification
User    ──1:N──► Message (sent)
User    ──1:N──► Message (received)
User    ──1:N──► Notification
```
