# Project Plan & Specifications: E-Commerce Merchandise Shop (MVP)

This document outlines the strict technical specifications and requirements for developing and deploying the Minimum Viable Product (MVP) of the E-Commerce Merchandise Shop.

## 1. Tech Stack
- **Backend**: Node.js + Express (TypeScript)
- **Frontend**: React + TypeScript (Vite bundler)
- **Database**: PostgreSQL
- **Process Management**: PM2 for running the server on the VM

## 2. Infrastructure & Server Access
All connection parameters are stored in your `.env` file. Read it before starting.
- `SSH_IP` РІР‚вЂќ IP address of your target Ubuntu VM.
- `SSH_USER` РІР‚вЂќ username on the server (`base-ubuntu`).
- `DATABASE_URL` РІР‚вЂќ PostgreSQL connection string.

Use the SSH private key `./id_ed25519` for passwordless access:
`ssh -i ./id_ed25519 base-ubuntu@$SSH_IP`

РІС™В РїС‘РЏ IMPORTANT: The VM is already pre-configured with Node.js (v18), npm, PostgreSQL (v16), and PM2. The database 'app' and the default 'postgres' user (password: 'postgres') are already created and fully configured. You do NOT need to install these system dependencies or configure database users РІР‚вЂќ you can immediately proceed to running migrations and deploying your application.

## 3. Network & Server Port Binding
- **Subdomain Configuration**: Use `http://deepseek-shop.voimaxgm.online` for any redirect configurations, CORS policies, and client-side API URLs.
- **Unified Port Design**: 
  - The React frontend must be compiled into static assets (`npm run build`).
  - The Express backend must serve these static assets and handle API requests on a single unified port.
- **Deployment Port: `80` (Standard HTTP)**: Configure your Express server to listen directly on port `80` (use `sudo` or `authbind` for PM2 to bind to privileged ports). Do NOT attempt to install SSL/TLS certificates, HTTPS, or Certbot. The app must be directly accessible via `http://deepseek-shop.voimaxgm.online` (or `http://<SSH_IP>`).

## 4. Workflow & Autonomy (Critical!)
- **Full Autonomy**: Make all technical, architectural, and configuration decisions on your own. Do not ask any clarifying questions during development. Your task is to deliver a fully finished, turnkey product.
- **Continuous Execution**: Work continuously without stopping to wait for user confirmations or approvals. Complete the environment setup, coding, and deployment in one single run.
- **Custom UI/UX Design**: Design a modern, clean, user-friendly, and visually appealing interface **based entirely on your own taste and style** representing an online store selling clothes and posters themed around indie games (like Vibe Miner). You are free to use any CSS libraries (e.g., Tailwind CSS, Material UI, Bootstrap, Styled Components). The design should reflect your model's unique aesthetic vision.
- **Granular Git Commits (Mandatory)**: You must commit your progress frequently. Make a separate Git commit for every logical step, completed subtask, or feature (e.g., initial environment setup, database tables creation, authentication logic, WebSocket integration, styling, deployment script). Write descriptive, meaningful, and professional commit messages in English. Push your commits to the remote `origin` repository regularly throughout the session. Do NOT make one giant commit at the end.
- **Strict Commit Message Cleanliness**: Your commit messages must look strictly human-written and organic. Do NOT include, append, or allow any platform-generated footers, bot signatures, automation tags, or co-author metadata (such as 'Co-Authored-By', 'Generated with', or 'Devin'). Keep the commit history 100% clean, professional, and free of any bot-related signatures.
- **Strict Single-Agent Execution**: You must execute the entire task by yourself as a single, unified agent. Do NOT spawn, launch, or delegate any work to parallel subagents, background agents, or helper agent instances. All coding, debugging, and deployment steps must be processed sequentially within your own main agent session. This is a strict constraint for consistency and resource control.

## 5. Functional Requirements
### 5.1. Catalog & Products
- **Product Catalog**: Showcase the products with categories, filters (by size, price, category), and sorting.
- **Product Details**: Image, description, price, sizes, and stock availability.
- **Cart**: Add, update, and remove items (using LocalStorage with optional sync to backend on login).
- **Cart Import/Export**: Add a feature to export the current shopping cart state as a base64-encoded JSON string, and a form to import this string back to restore the cart items.

### 5.2. Authentication & Profiles
- **Registration/Login**: Email, password sign-up and sign-in.
- **Profile & Order History**: User dashboard showcasing their personal details and a list of all their past orders with statuses.
- **Password Recovery**: Implement a "Forgot Password" flow where a user can enter their email to request a password reset, generating a temporary recovery token that allows them to update their password.

### 5.3. Checkout Flow
- **Order Checkout**: User form (Name, Address, Phone, Payment method - mocked).
- **Inventory Management**: Automatically decrease product stock counts upon successful checkout.

### 5.4. Admin Dashboard (`/admin`)
- **Product Management**: Ability for authorized admins to add, edit, or delete catalog items. When adding a product, the admin can specify an external image URL, and the server must download the image from that URL and store it locally.
- **Order Management**: List of all orders, ability to change order status (New в†’ Confirmed в†’ Shipped в†’ Delivered).

### 5.5. Server Logging
- **System Logging**: The Express backend must automatically log all critical system events (such as failed/successful login attempts, checkout transactions, and product price changes by admins) to a local file named `server.log` in the project root.

## 6. Database Seeding & Assets
The 10 pre-generated product images are already provided in the `./assets` directory in the project root. Make sure they are committed to Git so that they are pulled to the VM during deployment, or copied/transferred to the target VM during deployment, as they are required to be present on the server.
Upon initialization:
1. Your Express backend / React frontend build script must copy these images to the client`s public assets folder (e.g. `client/public/assets/` or serve them statically via `/assets` from the server) on the target VM.
2. The database must be automatically seeded with:
   - **15 indie-themed apparel/poster products** (themed around Vibe Miner and other indie games). The first 10 products must correspond to the 10 provided t-shirt images (filenames: `tshirt_vibe_miner.png`, `tshirt_pixel_heart.png`, `tshirt_synthwave.png`, `tshirt_game_over.png`, `tshirt_cyber_cat.png`, `tshirt_loading_bar.png`, `tshirt_retro_gamepad.png`, `tshirt_glitch_skull.png`, `tshirt_space_invader.png`, `tshirt_d20_dice.png`). The product database record must use the local served URL for the image (e.g., `/assets/tshirt_vibe_miner.png` or `/uploads/tshirt_vibe_miner.png` based on your static files serving architecture).
   - **3 test users** (including one admin user with credentials `admin` / `admin`).
   - **5 mock completed orders** in the history.

## 7. Automated Deployment Script (`deploy.sh`)
Write a `deploy.sh` script in the project root to automate the following steps on the remote VM:
1. Pull/update the code on the VM (making sure the product assets from `./assets` are present on the VM).
2. Install npm dependencies for both backend and frontend.
3. Run database migrations and seed the database.
4. Build the React frontend.
5. Configure and start the Node.js application under PM2 on port 80.

## 8. First Response Checklist & Completion Criteria (Mandatory)
Before writing any code, perform the following verification:
1. SSH into the VM, perform the initial setup (install Node.js, PostgreSQL, PM2), and configure the database.
2. Verify the environment by printing installed versions (`node -v && npm -v`) and testing the database connection with `SELECT version();`.
3. Provide a brief implementation plan (5-7 lines): list the database tables you will create and outline the software architecture.

Immediately after presenting the plan, proceed to coding and deployment.

РІС™В РїС‘РЏ **Definition of Done**: Do not stop or declare completion until the entire MVP is fully built, successfully deployed, and running under PM2 on port 80. The session is complete only when the app is fully online and reachable at `http://deepseek-shop.voimaxgm.online`.
