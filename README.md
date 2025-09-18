Golden Cars Florida - Car Dealership Web App
🚗 Project Overview

Golden Cars Florida is a modern web application for a car dealership, built with Next.js and Supabase. Users can browse, filter, and view cars, while admins can securely log in to manage listings, track analytics, and handle business operations efficiently. The app integrates Vercel Blob for media storage and is fully deployed on Vercel, making it fast and production-ready.

🌟 Key Features

User-Facing

- Browse cars with filtering by make, model, year, and price

- View detailed car information including images and specifications

- Contact forms for inquiries or test drives

Admin Panel

- Secure authentication with Supabase Auth

- Add, edit, and delete car listings (CRUD)

- Analytics for most viewed cars

- Media upload via Vercel Blob

🛠️ Tech Stack

- Frontend: Next.js, React, Tailwind CSS

- Backend / Database: Supabase

- File Storage: Vercel Blob

- Authentication: Supabase Auth

- Hosting: Vercel

- Other notable libraries: Radix UI for components, Recharts for analytics, React Hook Form for forms, i18next for localization

📦 Installation & Setup

1. Clone the repository:

  git clone https://github.com/AnmarRahman/golden-cars-fl.git
  cd golden-cars-fl

2. Install dependencies:

  npm install

3. Configure environment variables (.env.local):

  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url

  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

  SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

4. Run Supabase SQL scripts to set up the database tables and initial data:

  The scripts are located in the scripts/ folder.

  Open the Supabase SQL editor and execute each script to initialize your database.

5. Start the development server:

  npm run dev

  Visit the app at http://localhost:3000

📸 Screenshots

<img width="1878" height="931" alt="image" src="https://github.com/user-attachments/assets/8148f703-1d08-4375-8961-bd8e290a69d7" /><br />

<img width="1878" height="931" alt="image" src="https://github.com/user-attachments/assets/d7fef23a-42ed-4bf4-a2b8-0553b635387f" /><br />

<img width="1878" height="931" alt="image" src="https://github.com/user-attachments/assets/e1dcd115-2a3c-4a16-aabb-b36e78365c5d" /><br />

<img width="1878" height="931" alt="image" src="https://github.com/user-attachments/assets/fceabb6b-2f7e-47d0-b201-c374df7badbf" /><br />

<img width="390" height="844" alt="image" src="https://github.com/user-attachments/assets/eabd24be-30ae-4722-bb16-b535fdb049fc" /><br />

<img width="390" height="844" alt="image" src="https://github.com/user-attachments/assets/60fd6b46-ae6c-41a8-8734-7a5f031f88fb" /><br />

<img width="390" height="844" alt="image" src="https://github.com/user-attachments/assets/3894c946-39ca-4245-ac97-2365a1d1da52" /><br />

<img width="390" height="844" alt="image" src="https://github.com/user-attachments/assets/6fe80d4f-b9a6-4095-8b2a-565c651bc06b" /><br />

🔗 Live Demo

Experience the live site here: goldencarsfl.com
