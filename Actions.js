const ACTIONS = {
  JOIN: "join",
  JOINED: "joined",
  DISCONNECTED: "disconnected",
  CODE_CHANGE: "code-change",
  SYNC_CODE: "sync-code",
  LEAVE: "leave",
  SEND_MESSAGE: "send-message",
  RECEIVE_MESSAGE: "receive-message",
  INTERVIEW_WARNING: "interview_warning", // New action for interview mode warnings
  TOGGLE_INTERVIEW_MODE: "toggle_interview_mode", // New action
  INTERVIEW_MODE_UPDATED: "interview_mode_updated", // New action
  LANGUAGE_CHANGE: "language-change", // New action for language change
  FILE_OPENED: "file-opened", // New action for file opened
};

module.exports = ACTIONS;
