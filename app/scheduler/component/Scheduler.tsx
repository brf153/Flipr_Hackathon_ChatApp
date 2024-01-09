"use client"
import React from 'react';
import { BsTerminalPlus } from 'react-icons/bs';
import GroupChatModal from './DialogModal';
import Table from './Table';

interface ScheduledMessage {
  receiverName: string;
  scheduledTime: string;
}

interface SchedulerProps {
  // userName: string;
  // scheduledMessages: ScheduledMessage[];
  userName: any;
  scheduledMessages: any;
  users: any
}

const Scheduler = ({ scheduledMessages, userName, users }: SchedulerProps) => {

  console.log("scheduledMessages", scheduledMessages)
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const openDialog = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 flex flex-col gap-8">
      <h1 className="text-4xl font-bold mb-4 underline underline-offset-4">
        Schedule your message {userName}
      </h1>
      <div className="text-2xl font-bold mb-4 flex gap-4">
        <div>
          New message
        </div>
        <button onClick={openDialog}>
        <BsTerminalPlus size={32}/>
      </button>

      <GroupChatModal 
        users={users} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
      />
      </div>
      <div>
      <h2 className="text-2xl font-bold mb-4">Scheduled Messages</h2>
              {scheduledMessages ? (
        <Table messages={scheduledMessages} userName={userName} />
      ) :
        (<div>no messages</div>)
      }
      </div>

    </div>
  );
};

export default Scheduler;