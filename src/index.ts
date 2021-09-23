import React from 'react';
import firebaseAnalytics, { firebase } from '@react-native-firebase/analytics';
import Analytics from 'appcenter-analytics';
import AsyncStorage from '@react-native-community/async-storage';

interface Event {
  key: string;
  data: any;
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

const validateLogEventObj = (event: Event) => {
  if (event && typeof event === 'object') {
    const { key, data } = event;
    if (key && typeof key === 'string' && isValidLogData(data)) {
      return true;
    }
    console.warn('please check data of event structure (key is string and data must be a object).');
    return false;
  } else {
    console.warn('please check event structure (event must be a object).');
  }
  return false;
};

const getDeviceInfo = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('@deviceInfo')
    return jsonValue != null ? JSON.parse(jsonValue) : null
  } catch(e) {
    // read error
  }

}

export const logEvent = async (event: Event) => {
  if (validateLogEventObj(event)) {
    try {
      // const baseData =  await getDeviceInfo();
      const { key, data } = event;
      // firebase
      const transformData: any = {}
      for (var p in data) {
        transformData[p] = String(data[p]);
      }
      Analytics.trackEvent(key, transformData);
      await firebaseAnalytics().logEvent(key, transformData);
      // AppCenter
    } catch (error) {
      console.warn('error', error);
    }
    
  }
};
