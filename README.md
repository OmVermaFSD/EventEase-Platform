# 🎟️ EventEase - High-Performance Flash Sale Platform

![EventEase Dashboard](https://github.com/OmVermaFSD/EventEase-Platform/blob/main/screenshot.png?raw=true)
*(Replace this URL with your actual screenshot link)*

> **Live Demo Video:** [Click here to watch the Payment Flow & Red-Seat Locking](YOUR_YOUTUBE_OR_LOOM_LINK_HERE)

## ⚡ Engineering Challenge
I built this platform to solve the **"Ticketmaster Problem"**:
1.  **Race Conditions:** What happens when 1,000 users click "Buy" on Seat A1 at the same millisecond?
2.  **System Overload:** How do we protect the database from crashing during a flash sale?

## 🛠️ The Solution (Architecture)
* **Backend:** Java 17, Spring Boot 3
* **Database:** PostgreSQL (with Optimistic Locking `@Version`)
* **Frontend:** React, TailwindCSS (Real-time Terminal UI)
* **DevOps:** Docker, Nginx, Multi-stage Builds

## 🚀 Key Features Implemented
1.  **Optimistic Locking:** Prevents "Double Booking" without locking the entire database table.
2.  **Circuit Breaker Pattern:** Frontend automatically queues requests when latency spikes.
3.  **Real-World Payment Simulation:** Integrated a mock payment gateway with latency checks and receipt generation.
4.  **Transaction Logging:** An immutable audit log of every system event (Booking, Error, Payment).

## 💻 How to Run This Project
This project is fully containerized. You only need Docker.

```bash
# 1. Clone the repo
git clone [https://github.com/OmVermaFSD/EventEase-Platform.git](https://github.com/OmVermaFSD/EventEase-Platform.git)

# 2. Run with Docker Compose
docker-compose up --build

# 3. Open Browser
# http://localhost (Frontend)
