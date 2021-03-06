import AsyncStorage from '@react-native-community/async-storage';

const MAX_MINUTES_POST = 10;
export const MAX_LENGTH = 25;
export const  DIAGNOSTICS_LOGS = '@diagnosticsLogs';

export async function storeWith(object: any, key: string) {
  try {
    const jsonValue = JSON.stringify(object);
    await AsyncStorage.setItem(key, jsonValue);
    return object;
  } catch (e) {
    // save error
    return undefined;
  }
}

export async function getObjectByKey(key: string) {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    // read error
    return null;
  }
}

export async function getDiagnosticsLogs() {
  const logObj = await getObjectByKey(DIAGNOSTICS_LOGS);
  return logObj;
}

export async function setDiagnosticsLogs(event: any) {
  if (event && typeof event === 'object') {
    const logObj = await getDiagnosticsLogs();
    const {events} = logObj || {};
    const updateAt = new Date();
    const logStore = {
      updateAt,
      events: Array.isArray(events) ? [...events, event] : [event]
    };

   return  storeWith(logStore, DIAGNOSTICS_LOGS)
  }
  return undefined
}

export async function cleanDiagnosticsLogs() {
  storeWith({}, DIAGNOSTICS_LOGS);
}

export async function cleanDiagnosticsLogsToEvents(elements: number) {
  const logObj = await getDiagnosticsLogs();
  const {events} = logObj || {};
  if (events && events.length > elements) {
    const newerEvents = events.slice(elements);
    const updateAt = new Date();
    const logStore = {
      updateAt,
      events: newerEvents,
    };
    await storeWith(logStore, DIAGNOSTICS_LOGS)
    // const Logs = await getDiagnosticsLogs();
  } else {
    await storeWith({}, DIAGNOSTICS_LOGS);
  }
}

function minutesDateToNow(date?: Date) {
  if (!date) {
    return 0;
  }
  const today = new Date();
  const minutes: number = Math.abs(today.getTime() - date.getTime()) / (1000 * 60) % 60;
  return minutes;
}

export function validateLogObj(logObj: any) {
  if (logObj) {
    const {events, updateAt} = logObj;
    if (events && Array.isArray(events)) {
      const minutes = minutesDateToNow(updateAt);
      return events.length % MAX_LENGTH === 0;
    }
  }
  return false;
}

export async function calculateToPostApi(event: any) {
  const logObj = await setDiagnosticsLogs(event);

  if (logObj) {
    if (validateLogObj(logObj)) {
      const {events, updateAt} = logObj;
      const postEvents = events.length >= MAX_LENGTH ? events.slice(0,MAX_LENGTH) : events;
      return postEvents;
    }
  }
  return undefined;
}