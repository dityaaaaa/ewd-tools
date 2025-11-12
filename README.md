# EWD Tools (Early Warning Detection System)

This repository contains the source code for **EWD Tools**, a comprehensive web application designed to manage, analyze, and process reports for an Early Warning Detection system. It appears to be a tool for a financial or credit institution to handle borrower data, generate dynamic reports from templates, and manage a sophisticated, multi-level approval workflow.

The application is built as a modern monolith using the **Laravel + React (Inertia.js)** stack.

## ✨ Key Features

Based on the project's routes, controllers, and services, the application includes:

- **Role-Based Access Control (RBAC):** Utilizes `spatie/laravel-permission` to manage user roles (e.g., `admin`, `relationship_manager`, `risk_analyst`).
- **Multi-Level Approval Workflow:** A sophisticated system for reports to be submitted, reviewed, and approved by a chain of roles (e.g., ERO, Kadept Bisnis, Kadiv ERO).
- **Master Data Management:** Full CRUD interfaces for core entities like `Borrowers`, `Divisions`, `Users`, and reporting `Periods`.
- **Dynamic Form & Template Engine:** Allows admins to create and version report `Templates`, `Aspects`, and questions, which are then used to generate dynamic forms.
- **Multi-Step Report Submission:** A user-friendly, multi-step form for filling out complex reports, including the ability to save progress on each step (`forms.saveStep`).
- **Audit Trail:** An admin-accessible feature to track significant changes and actions within the system.
- **Watchlist System:** Functionality for flagging and monitoring specific borrowers or reports.

## 🛠️ Tech Stack

### Backend

- **Framework:** Laravel 12
- **Language:** PHP 8.4
- **Key Packages:**
    - `inertiajs/inertia-laravel` (Modern monolith adapter)
    - `spatie/laravel-permission` (Role & permission handling)
    - Pest (PHP Testing Framework)

### Frontend

- **Framework:** React 19
- **Language:** TypeScript
- **Bundler:** Vite
- **UI:**
    - Tailwind CSS
    - **shadcn/ui** (built on Radix UI)
    - Radix UI (Headless components)
    - Lucide Icons
- **State Management:** Zustand
- **Tooling:** ESLint, Prettier

## 🚀 Getting Started

### Prerequisites

- PHP 8.4+
- Composer
- Node.js (v22.x recommended)
- NPM
- A database (Project defaults to SQLite, but MySQL or PostgreSQL are recommended for production)

### Installation

1.  **Clone the repository:**

    ```sh
    git clone [https://github.com/dityaaaaa/ewd-tools.git](https://github.com/dityaaaaa/ewd-tools.git)
    cd ewd-tools
    ```

2.  **Install backend dependencies:**

    ```sh
    composer install
    ```

3.  **Install frontend dependencies:**

    ```sh
    npm install
    ```

4.  **Set up environment:**
    The `post-root-package-install` script should automatically create your `.env` file from `.env.example`. If not, run:

    ```sh
    cp .env.example .env
    ```

5.  **Configure your `.env` file:**
    - By default, the project is configured to create and use a `database/database.sqlite` file.
    - If you prefer to use MySQL or PostgreSQL, update the `DB_*` variables in your `.env` file accordingly.

6.  **Run setup commands:**
    ```sh
    php artisan key:generate
    php artisan migrate --seed
    ```
    _(Note: The `--seed` flag is **critical** as it runs `RolePermissionSeeder`, `AdminSeeder`, and other essential data seeders.)_

### Running Locally

This project includes a convenient script to run the server, queue, and Vite dev server all at once using `concurrently`.

```sh
composer run dev
```
