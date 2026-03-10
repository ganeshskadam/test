# FlowQueue API Documentation

Base URL: `http://localhost:4000/api`

All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

---

## Authentication

### POST /auth/register
Register a new user account.

**Request Body**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "secret123",
  "role": "CLIENT"
}
```
`role` must be `CLIENT` or `WORKER` (privileged roles cannot be self-assigned).

**Response 201**
```json
{
  "message": "Registration successful",
  "token": "<jwt>",
  "user": { "id": "...", "email": "...", "name": "...", "role": "CLIENT" }
}
```

---

### POST /auth/login
Authenticate with email + password.

**Request Body**
```json
{
  "email": "owner@flowqueue.com",
  "password": "owner123"
}
```

**Response 200**
```json
{
  "message": "Login successful",
  "token": "<jwt>",
  "user": { "id": "...", "role": "OWNER", ... }
}
```

---

### GET /auth/me 🔒
Returns the authenticated user's profile.

**Response 200**
```json
{
  "user": {
    "id": "...",
    "email": "...",
    "name": "...",
    "role": "CLIENT",
    "clientProfile": { "freeProjectsUsed": 1, "freeProjectsLimit": 3 }
  }
}
```

---

## Projects

### GET /projects 🔒
- **CLIENT**: returns only their own projects
- **OWNER / MANAGEMENT / WORKER**: returns all projects

**Response 200**
```json
{ "projects": [ { "id": "...", "title": "...", "status": "SUBMITTED", ... } ] }
```

---

### POST /projects 🔒
Submit a new project (CLIENT role required).

**Request Body**
```json
{
  "title": "My Website",
  "description": "A full e-commerce site with cart and payments.",
  "category": "Web Development",
  "tier": "STANDARD",
  "priority": "NORMAL",
  "budget": 1500,
  "deadline": "2024-06-01",
  "deliverables": "Responsive website, source code"
}
```

**Response 201**
```json
{ "message": "Project submitted successfully", "project": { "id": "...", "status": "SUBMITTED" } }
```

---

### GET /projects/:id 🔒
Get project details. Clients can only see their own.

---

### PATCH /projects/:id 🔒
Update a project. Clients can only edit DRAFT projects.

---

### DELETE /projects/:id 🔒
Delete a project. OWNER or client (DRAFT only).

---

### GET /projects/:id/messages 🔒
List messages on a project. Clients only see external messages.

---

### POST /projects/:id/messages 🔒
Send a message on a project thread.

**Request Body**
```json
{
  "content": "Can you provide more details about the budget?",
  "receiverId": "<user-id>",
  "isInternal": false
}
```

---

## Admin Endpoints (OWNER role required)

### GET /admin/pending-approvals 🔒👑
Returns all projects with `status = SUBMITTED`.

**Response 200**
```json
{
  "projects": [
    {
      "id": "...",
      "title": "My Website",
      "status": "SUBMITTED",
      "submittedBy": {
        "name": "Jane Client",
        "email": "jane@example.com",
        "clientProfile": { "freeProjectsUsed": 0, "freeProjectsLimit": 3 }
      }
    }
  ],
  "count": 1
}
```

---

### POST /admin/approve-project/:id 🔒👑
Approve a submitted project.

**Request Body** (optional)
```json
{ "approvalNotes": "Looks great! Starting next week." }
```

**Response 200**
```json
{
  "message": "Project approved successfully",
  "project": { "status": "APPROVED", "queuePosition": 1, "estimatedStartDate": "..." }
}
```

---

### POST /admin/reject-project/:id 🔒👑
Reject a submitted project with a mandatory reason.

**Request Body**
```json
{ "rejectionReason": "Budget is too low for the scope requested." }
```

**Response 200**
```json
{ "message": "Project rejected", "project": { "status": "REJECTED", ... } }
```

---

### POST /admin/request-info/:id 🔒👑
Send a message to the client requesting more information.

**Request Body**
```json
{ "message": "Please clarify the number of product pages needed." }
```

**Response 201**
```json
{ "message": "Info request sent", "data": { ... } }
```

---

## Error Codes

| HTTP | Meaning |
|------|---------|
| 400 | Bad request / missing required fields |
| 401 | Missing or invalid JWT |
| 403 | Insufficient permissions |
| 404 | Resource not found |
| 409 | Conflict (e.g. email already in use) |
| 500 | Internal server error |

All error responses have the shape:
```json
{ "error": "Human-readable message" }
```
