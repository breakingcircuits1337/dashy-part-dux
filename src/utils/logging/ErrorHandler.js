import { warningMsg, statusMsg, statusErrorMsg } from '@/utils/logging/CoolConsole';
import { sessionStorageKeys } from '@/utils/config/defaults';
import { reportError } from '@/utils/logging/SentryRef';

const MAX_ERROR_LOG_BYTES = 50 * 1024; // 50 KB cap to prevent sessionStorage quota overflow

/* Makes the current datetime, like YYYY-MM-DD hh:mm:ss */
const makeTime = () => {
  const now = new Date();
  const pad = (digit) => String(digit).padStart(2, '0');
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  return `${date} ${time}`;
};

/* Appends recent errors to sessionStorage, trimming oldest entries when over cap */
const appendToErrorLog = (msg) => {
  let errorLog = sessionStorage.getItem(sessionStorageKeys.ERROR_LOG) || '';
  errorLog += `[${makeTime()}] ${msg}\n`;
  if (errorLog.length > MAX_ERROR_LOG_BYTES) {
    // Drop the oldest half of the log when we hit the cap
    const half = Math.floor(errorLog.length / 2);
    const cutPoint = errorLog.indexOf('\n', half);
    errorLog = cutPoint !== -1 ? errorLog.slice(cutPoint + 1) : '';
  }
  try {
    sessionStorage.setItem(sessionStorageKeys.ERROR_LOG, errorLog);
  } catch (e) {
    // Quota exceeded — clear and start fresh
    sessionStorage.removeItem(sessionStorageKeys.ERROR_LOG);
  }
};

/**
 * Function called when an error happens
 * Will call to function which prints helpful message to console
 * If error reporting is enabled, will also log the message to Sentry
 * If you wish to use your own error logging service, put code for it here
 */
export const ErrorHandler = function handler(msg, errorStack) {
  warningMsg(msg, errorStack); // Print to console
  appendToErrorLog(msg); // Save to local storage
  reportError(`[USER-WARN] ${msg}`); // Report to bug tracker (if enabled)
};

/* Similar to error handler, but for recording general info */
export const InfoHandler = (msg, title) => {
  statusMsg(title || 'Info', msg);
};

/* Outputs warnings caused by the user, such as missing field */
export const WarningInfoHandler = (msg, title, log) => {
  statusErrorMsg(title || 'Warning', msg, log);
};

/* Titles for info logging */
export const InfoKeys = {
  AUTH: 'Authentication',
  CLOUD_BACKUP: 'Cloud Backup & Restore',
  EDITOR: 'Interactive Editor',
  RAW_EDITOR: 'Raw Config Editor',
  VISUAL: 'Layout & Styles',
};

export default ErrorHandler;
