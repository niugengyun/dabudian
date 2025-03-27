import React from 'react';
const UserReferenceValue = ({ inviter }) => {
    if (!inviter)
        return null;
    return (React.createElement("span", null, inviter.phone));
};
export default UserReferenceValue;
