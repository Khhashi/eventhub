# API Documentation

Base URL: `https://eventmeeting-f3eu.onrender.com/api` (Production) or `http://localhost:3000/api` (Development)

## Authentication

Most endpoints require a valid JWT token. The token is sent as an `httpOnly` cookie automatically with requests.

### Login with Google
```
GET /auth/google
Redirects to Google OAuth login
```

### Logout
```
POST /auth/logout
Response: { message: "Logged out successfully" }
```

## Events API

### Get All Events
```
GET /events
Query Parameters:
  - category: string (optional)
  - date: string (optional, ISO 8601 format)
  - search: string (optional)

Response:
{
  "events": [
    {
      "_id": "ObjectId",
      "title": "Event Title",
      "description": "Event description",
      "date": "2026-11-17T19:00:00Z",
      "location": "Oslo",
      "category": "sports",
      "createdBy": { "_id": "UserId", "name": "Creator Name" },
      "attendees": [{ "_id": "UserId", "name": "Attendee Name" }],
      "createdAt": "2026-11-17T10:00:00Z",
      "updatedAt": "2026-11-17T10:00:00Z"
    }
  ]
}
```

### Get Event by ID
```
GET /events/:id

Response:
{
  "event": { ... }
}
```

### Create Event (Requires Authentication)
```
POST /events
Headers: Authorization required (JWT cookie)

Body:
{
  "title": "Event Title",
  "description": "Event description",
  "date": "2026-11-17T19:00:00Z",
  "location": "Oslo",
  "category": "sports"
}

Response: { "event": { ... } }
```

### Update Event (Requires Authentication & Ownership)
```
PUT /events/:id
Headers: Authorization required

Body: (All fields optional)
{
  "title": "New Title",
  "description": "New description",
  "date": "2026-11-18T19:00:00Z",
  "location": "New Location",
  "category": "music"
}

Response: { "event": { ... } }
```

### Delete Event (Requires Authentication & Ownership)
```
DELETE /events/:id

Response: { message: "Event deleted successfully" }
```

## Registration API

### Register for Event (Requires Authentication)
```
POST /events/:id/register

Response: { "event": { ... } }
```

### Unregister from Event (Requires Authentication)
```
POST /events/:id/unregister

Response: { "event": { ... } }
```

## User API

### Get Current User (Requires Authentication)
```
GET /users/me

Response:
{
  "user": {
    "_id": "UserId",
    "name": "User Name",
    "email": "user@example.com",
    "picture": "https://...",
    "role": "organizer",
    "createdAt": "2026-11-17T10:00:00Z"
  }
}
```

### Update User Profile (Requires Authentication)
```
PUT /users/me

Body:
{
  "name": "New Name",
  "picture": "https://...",
  "theme": "dark"
}

Response: { "user": { ... } }
```

## Error Responses

### 400 Bad Request
```json
{ "message": "Invalid input" }
```

### 401 Unauthorized
```json
{ "message": "Authentication required" }
```

### 403 Forbidden
```json
{ "message": "Not authorized to perform this action" }
```

### 404 Not Found
```json
{ "message": "Resource not found" }
```

### 500 Server Error
```json
{ "message": "Internal server error" }
```

## Real-Time Events (WebSocket)

Socket.IO connection: `socket.on('eventRegistrationUpdated', (event) => {})`

Events emitted:
- `eventRegistrationUpdated` - When user registers/unregisters for an event
- `eventCreated` - When a new event is created
- `eventUpdated` - When an event is updated
- `eventDeleted` - When an event is deleted

## Rate Limiting

Production deployment includes rate limiting to prevent abuse:
- 100 requests per 15 minutes per IP address
- 50 requests per 15 minutes per authenticated user

## Pagination

Large result sets support pagination:
```
GET /events?page=1&limit=20
```

## Timestamps

All timestamps are in ISO 8601 format (UTC).
