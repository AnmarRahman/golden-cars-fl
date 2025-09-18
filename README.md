Golden Cars Florida - Car Dealership Web App
🚗 Project Overview

Golden Cars Florida is a modern web application for a car dealership, built with Next.js and Supabase. Users can browse, filter, and view cars, while admins can securely log in to manage listings, track analytics, and handle business operations efficiently. The app integrates Vercel Blob for media storage and is fully deployed on Vercel, making it fast and production-ready.

🌟 Key Features
User-Facing

Browse cars with filtering by make, model, year, and price

View detailed car information including images and specifications

Contact forms for inquiries or test drives

Admin Panel

Secure authentication with Supabase Auth

Add, edit, and delete car listings (CRUD)

Analytics for most viewed cars

Media upload via Vercel Blob

🛠️ Tech Stack

Frontend: Next.js, React, Tailwind CSS

Backend / Database: Supabase

File Storage: Vercel Blob

Authentication: Supabase Auth

Hosting: Vercel

Other notable libraries: Radix UI for components, Recharts for analytics, React Hook Form for forms, i18next for localization

📦 Installation & Setup

Clone the repository:

git clone https://github.com/AnmarRahman/golden-cars-fl.git
cd golden-cars-fl


Install dependencies:

npm install


Configure environment variables (.env.local):

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key


Run Supabase SQL scripts to set up the database tables and initial data:

The scripts are located in the scripts/ folder.

Open the Supabase SQL editor and execute each script to initialize your database.

Start the development server:

npm run dev


Visit the app at http://localhost:3000

📸 Screenshots

<img width="1878" height="931" alt="image" src="https://github.com/user-attachments/assets/8fd40950-f1f4-4d50-8b12-84939cb7853e" />

<img width="1878" height="931" alt="image" src="https://github.com/user-attachments/assets/6870241c-e04c-410c-bc7d-02a701a4fbbc" />

<img width="1878" height="931" alt="image" src="https://github.com/user-attachments/assets/276287d0-d4ef-4f1e-a55e-96ef1b8e406f" />

🔗 Live Demo

Experience the live site here: goldencarsfl.com
