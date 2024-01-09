"use client"
import React from 'react';

interface Message {
  id: string;
  receiverName: string[];
  userName: string;
  message: string;
  time: string;
}

interface TableProps {
  messages: Message[];
  userName: string;
}

const Table: React.FC<TableProps> = ({ messages, userName }) => {
    const formatDateTime = (datetime: string): string => {
        const date = new Date(datetime);
        return date.toLocaleString(); // Adjust options as needed
      };
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead>
        <tr>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            To
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            From
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Message
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Date and Time
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {messages.map((message) => (
          <tr key={message.id}>
            <td className="px-6 py-4 whitespace-nowrap">{message.receiverName.join(', ')}</td>
            <td className="px-6 py-4 whitespace-nowrap">{userName}</td>
            <td className="px-6 py-4 whitespace-nowrap">{message.message}</td>
            <td className="px-6 py-4 whitespace-nowrap">{formatDateTime(message.time)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
