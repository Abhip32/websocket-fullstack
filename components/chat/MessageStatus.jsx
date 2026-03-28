import React from 'react';
import { Check } from 'lucide-react';

export const MessageStatus = ({ status, deliveredTo = [], readBy = [] }) => {
  if (status === 'sent') {
    return (
      <div className="flex gap-0.5">
        <Check size={14} className="text-gray-400" />
      </div>
    );
  }

  if (status === 'delivered' && deliveredTo.length > 0) {
    return (
      <div className="flex gap-0.5">
        <Check size={14} className="text-gray-400" />
        <Check size={14} className="text-gray-400" />
      </div>
    );
  }

  if (status === 'read' || readBy.length > 0) {
    return (
      <div className="flex gap-0.5">
        <Check size={14} className="text-blue-500" />
        <Check size={14} className="text-blue-500" />
      </div>
    );
  }

  return null;
};
