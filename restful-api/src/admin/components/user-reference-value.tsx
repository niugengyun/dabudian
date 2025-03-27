import { RecordJSON } from 'adminjs';
import React from 'react';

interface Props {
  inviter: RecordJSON & {
    phone: string;
  };
}

const UserReferenceValue: React.FC<Props> = ({ inviter }) => {
  if (!inviter) return null;
  return (
    <span>{inviter.phone}</span>
  );
};

export default UserReferenceValue; 