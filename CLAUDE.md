# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

**Workfolio** is a freelancer work-management platform. The core value proposition: enter the app, see income at a glance, log hours in 10 seconds. The problem it solves is that freelancers lose track of hours worked, what to charge, which projects belong to which client, and open tasks.

Full product spec is in `idea-principal.txt`.

## Planned architecture

| Layer | Technology |
|-------|-----------|
| Backend | Python, FastAPI |
| Frontend | React |
| Auth | JWT |

## Domain model

**Client** — name, email, phone (optional), company (optional), list of projects.

**Project** — name, description, associated client, status (`active` | `paused` | `finished`), hourly rate, start/end date.

**Time entry** — project, date, hours worked (integer or two time slots), work description.

**Estimated billing (beta)** — hours × hourly rate; totals per project and per client.

## Pages / views

- **Login** — JWT-based auth.
- **Dashboard** — monthly income, weekly hours, active projects, chart.
- **Clients** — client list with nested projects (beta).
- **Projects** — project list and detail.
- **Time tracking** — log entries; filter by period; breakdown per project; chart.
- **Income** — chart view of earnings over time.

## UI requirements

- Dark mode support required from the start.
