import React from 'react';
import firebaseAnalytics, { firebase } from '@react-native-firebase/analytics';
import Analytics from 'appcenter-analytics';
import AsyncStorage from '@react-native-community/async-storage';
import { ApiResponse } from 'apisauce';
import Config from 'react-native-config';
import { v4 as uuid } from 'uuid';

import {api} from './HttpClient';

interface Event {
  event: string;
  data: any;
  datetime: string;
  timeZone: string;
  tierType: string;
  userType: string;
  appType: string;
  headers: any;
}

interface BaseData {
  uniqueId: string;
  brand: string;
  platform: 'android' | 'ios';
  carrier: string;
  deviceVersion: string;
  deviceId: string;
  version: string;
  InstallerPackage: string;
  airplaneMode: boolean;
  tagUser: string;
  isTablet: boolean;
  powerState: string;
}

type PLATFORMS_LOG = 'FIREBASE' | 'APPCENTER' | 'MY_PLATFORM';

export const analyticsInit = async () => {
  await firebase.analytics().setAnalyticsCollectionEnabled(true);
  await Analytics.setEnabled(true);
};

const isValidLogData = (data: any) => {
  if (data && typeof data === 'object') {
    return true;
  }
  console.warn('please check data of event structure (data must be a object).');
  return false;
};

const validateLogEventObj = (eventObj: Event) => {
  if (eventObj && typeof eventObj === 'object') {
    const { event, data } = eventObj;
    if (event && typeof event === 'string' && isValidLogData(data)) {
      return true;
    }
    console.warn(
      'please check data of event structure (event is string and data must be a object).',
    );
    return false;
  } else {
    console.warn('please check event structure (event must be a object).');
  }
  return false;
};

export const apiRequest = (data: any, headers: any ): Promise<ApiResponse<any, any>> => {
  const endPoint = Config.LOGS_API_URL;
  return api.post(endPoint, data, { headers });
};

const getDeviceInfo = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('@deviceInfo');
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    // read error
  }
};

const transformObj = (obj: any) => {
  const transformData: any = {};
  for (var p in obj) {
    transformData[p] = String(obj[p]);
  }
  return transformData;
};

export const logEvent = async (eventObj: Event, platforms: PLATFORMS_LOG[]) => {
  if (validateLogEventObj(eventObj) && platforms) {
    try {
      const { event, data, datetime, timeZone, tierType, userType, appType, headers } = eventObj;

      // firebase
      const transformData = transformObj(data);
      // AppCenter
      if (platforms.includes('APPCENTER')) {
        Analytics.trackEvent(event, transformData);
      }
      if (platforms.includes('FIREBASE')) {
        await firebaseAnalytics().logEvent(event, transformData);
      }
      if (platforms.includes('MY_PLATFORM')) {
        const baseData = await getDeviceInfo();
        const collectData = {
          deviceInfo: baseData,
          events: [
            {
              data,
              event,
              datetime,
              timeZone,
              appType,
            }
          ]
        };
        const _headers = {
          Authorization: Config.BASIC_AUTH,
          'X-User-Type': userType,
          'X-App-Type': appType,
          'X-Tier-Type': tierType,
          'X-Request-Id':  uuid(),
          ...(headers || {})
        }
        console.log('collectData', JSON.stringify(collectData));
        console.log('headers', JSON.stringify(_headers));

        apiRequest(collectData,_headers)
      }
    } catch (error) {
      console.warn('error', error);
    }
  }
};

export { default as AnalyticsAuth } from './Analytics';
