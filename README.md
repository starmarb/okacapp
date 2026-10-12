# Blue Collar Business Suite (okacapp)

A field service management platform built for a Texas-based HVAC business.

The goal: replace paper job sheets and phone-tag scheduling with a simple mobile-friendly tool a technician can use on-site, backed by a dashboard the office can use to manage the bigger picture.

Currently, we have been approaching this project in a modular approach, beginning with a more intuitive beta for select technicians before building up into the fully fleshed platform.

---

## Tech stack

| Layer                    | Choice                                                                   |
| ------------------------ | ------------------------------------------------------------------------ |
| Backend                  | Django-ninja with SQLite (Python)                                        |
| Frontend                 | Angular                                                                  |
| Object storage (planned) | Locally ran object storage                                               |
| Design reference         | [Figma — HVAC](https://www.figma.com/design/gNBD1QoUgaHAyzJuX4v92L/HVAC) |

---

## Running it Locally

make the `dev.sh` an executable with `chmod +x dev.sh`

Then, `./dev.sh` will run both the frontend (with `ng serve`) and backend (`manage.py runserver`).

Go to `localhost:4200` to view

---
