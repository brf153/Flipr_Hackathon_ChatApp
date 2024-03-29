# Chat App

A real-time chat application built with Next.js 13, Prisma, MongoDB, TypeScript, Pusher and deployed on Vercel.

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

- **Real-Time Communication:**
  - Pusher

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

## Detailed Implementation

### Authorization

- Created a `route.ts` file inside the `app/api/auth/[...nextauth]` folder to manage authentication using the NextAuth.js library.

- Utilized Google OAuth 2.0 for authorization, integrating the Google client library for React to establish OAuth.

- Implemented a registration and authorization form to manually register and authorize users. User data is collected on the client side, and authorization is performed by providing a token session.

- User details are stored in the MongoDB Atlas database, and Prisma is employed as the ORM for this project.


### Landing Page

After successful authentication, users will be directed to a page featuring a sidebar, a user message bar on the side, and a blank screen displaying the text `Select a chat or start a new conversation`.

The sidebar encompasses several options: Chat, Users, Scheduler, and Logout.

- **Chat:** Displays the user's chat history in the side user message bar.
  
- **Users:** Shows a list of all users registered in the Chat App.

- **Scheduler:** Allows users to schedule messages.

- **Logout:** Enables users to delete the session and log out.


### Messaging a User

- Upon selecting a user, a conversation message box will appear. Users can compose and send messages in the input box, supporting text, emojis, and images.

- If the user is currently active, the status will be displayed at the top of the conversation. To implement this feature, a custom `useActiveList` hook has been created. Initially, an empty `members` array is rendered. When a user clicks on a group or an individual user, that user is added to the `members` array. Subsequently, the hook checks the `members` array. If it contains the email of the person, it indicates that the user is currently active.


### Creating a Group

- To create a group, locate the `New Group` icon at the top of the user message box. Clicking on this icon allows you to form a group with fellow members who have registered their accounts in the Chat App.

- Once created, the new group will be displayed in the user message bar. Simply click on the group icon to initiate a conversation.

### Message Scheduler

- I have implemented a Message Scheduler in my app. You can access it by clicking on the button next to the `New Message` text. This action opens a dialog box, allowing you to schedule a new message.

- However, please note that there is an issue with the deployment on Vercel. The current implementation relies on the `setTimeout` function in the serverless backend of Next.js 13. Unfortunately, Vercel does not interpret the `setTimeout` function in the deployed environment, resulting in its omission.

- To address this issue more effectively, I would create a separate backend dedicated to scheduling messages. By making requests to this separate backend, we can ensure the reliable execution of your scheduled message functionality.


### Voice Messaging

- I've introduced a voice message icon in the input bar within the conversation list. However, there's an issue with its functionality.

- The problem arises from the voice recorder storing the file in .wav format. Currently, I attempt to convert this blob to a base64 string and then send it to the client. However, the implementation faces limitations as Pusher does not permit the transmission of longer messages.

- To enhance this feature, a more effective approach would be to break the base64 string into smaller chunks before sending it to the client. This modification should address the constraints posed by Pusher and allow for the successful transmission and rendering of voice messages.


