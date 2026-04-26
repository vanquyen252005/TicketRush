# TicketRush

## Create Event API

The backend runs on `http://localhost:9000` and exposes the event creation endpoint at `POST /api/admin/events`.

```bash
curl -X POST http://localhost:9000/api/admin/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Summer Music Fest 2026",
    "description": "Live concert with multiple artists.",
    "location": "Ho Chi Minh City",
    "imageUrl": "https://example.com/images/summer-music-fest.jpg",
    "startTime": "2026-06-15T19:30:00",
    "endTime": "2026-06-15T22:30:00",
    "status": "PUBLISHED"
  }'
```

Required fields:

- `name`
- `location`
- `startTime`
- `status`

`status` must match one of: `DRAFT`, `PUBLISHED`, `SOLD_OUT`, `CANCELLED`.
