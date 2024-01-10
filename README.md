# Chat App

A real-time chat application built with Next.js 13, Prisma, MongoDB, TypeScript, and deployed on Vercel.

## Features

- **Real-Time Messaging:** Engage in real-time conversations with other users.
- **Message Scheduling:** Schedule messages to be sent at a later time.
- **User Authentication:** Secure user authentication.
- **User Profiles:** View and manage user profiles.
- **Responsive Design:** A responsive UI for seamless user experience on various devices.

## Tech Stack

- **Frontend:**
  - Next.js 13
  - React
  - TypeScript
  - Tailwind CSS

- **Backend:**
  - Next.js Serverless functions
  - Prisma (MongoDB ORM)
  - MongoDB

- **Deployment:**
  - Vercel

## Getting Started

### Prerequisites

- Node.js (v18)

### Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/brf153/Flipr_Hackathon_ChatApp
   cd Flipr_Hackathon_Chatapp

2. **Install the dependencies:**
    ```bash
    npm i

3. **Make environment variable file**
   
   Make .env file and file in the info that is given in .env.example file.

4. **Migrate the database**
    ```bash
    npx prisma db push

5. **Run the server**
   ```bash
   npm run dev

