import analytics, { firebase } from '@react-native-firebase/analytics';

class Analytics {
  static init() {
    if (firebase.app().utils().isRunningInTestLab) {
      analytics().setAnalyticsCollectionEnabled(false);
    } else {
      analytics().setAnalyticsCollectionEnabled(true);
    }
  }

  static onSignIn = async (userObject: any) => {
    const { id } = userObject;
    await Promise.all([analytics().setUserId(id), this.logEvent('sign_in')]);
  };

  static onSignUp = async (userObject: any) => {
    const { id, datetime } = userObject;
    await Promise.all([
      analytics().setUserId(id),
      analytics().setUserProperty('created_at', datetime),
      this.logEvent('sign_up'),
    ]);
  };

  static logEvent = async (eventName: string, propertyObject = {}) => {
    await analytics().logEvent(eventName, propertyObject);
  };

  static onSignOut = async () => {
    await analytics().resetAnalyticsData();
  };
}

export default Analytics;
