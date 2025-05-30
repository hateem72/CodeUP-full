import React from "react";
import { useNavigate } from "react-router-dom";

const WorkspaceCard = ({ workspace, onInvite, onDelete, onUpdate, onRemoveMember, isOwned }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/workspace/${workspace._id}`);
  };

  return (
    <div className="bg-tertiary rounded-lg shadow-md p-5 hover:shadow-xl transition-all duration-300 border border-quaternary">
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-teal truncate max-w-[200px]">{workspace.name}</h3>
          <p className="text-sm text-senary mt-1">
            Status: <span className={workspace.isPublic ? "text-teal" : "text-yellow"}>{workspace.isPublic ? "Public" : "Private"}</span>
          </p>
          <p className="text-sm text-senary">
            Members: <span className="text-octonary">{workspace.members.length}</span>
          </p>
        </div>
        {isOwned && (
          <button
            onClick={() => onDelete(workspace._id)}
            className="text-quaternary hover:text-hover-teal transition-colors duration-200"
            title="Delete Workspace"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={handleNavigate}
          className="bg-teal text-background px-4 py-2 rounded-lg hover:bg-hover-teal transition-colors duration-200 text-sm font-semibold"
        >
          Open Workspace
        </button>
        {isOwned && (
          <>
            <button
              onClick={() => onInvite(workspace)}
              className="bg-yellow text-background px-4 py-2 rounded-lg hover:bg-hover-yellow transition-colors duration-200 text-sm font-semibold"
            >
              Invite Users
            </button>
            <button
              onClick={() => onUpdate(workspace)}
              className="bg-quaternary text-octonary px-4 py-2 rounded-lg hover:bg-tertiary transition-colors duration-200 text-sm font-semibold"
            >
              Edit
            </button>
          </>
        )}
      </div>

      {workspace.members.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-septenary mb-2">Members:</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-quinary scrollbar-track-background">
            {workspace.members.map((member) => (
              <div
                key={member.userId._id}
                className="flex justify-between items-center text-sm text-senary bg-quaternary p-2 rounded-md hover:bg-tertiary transition-colors duration-200"
              >
                <span className="truncate max-w-[150px]">{member.userId.displayName}</span>
                {isOwned && member.role !== "owner" && (
                  <button
                    onClick={() => onRemoveMember(workspace._id, member.userId._id)}
                    className="text-quaternary hover:text-hover-teal transition-colors duration-200"
                    title="Remove Member"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceCard;