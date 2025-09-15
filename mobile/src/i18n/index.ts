
import { useState, useEffect } from 'react';

export type Language = 'en' | 'hi';

// Storage key for language preference
const LANGUAGE_STORAGE_KEY = '@si_app_language';

// Translations object
const translations = {
  en: {
    // Common
    common: {
      continue: 'Continue',
      cancel: 'Cancel',
      ok: 'OK',
      back: 'Back',
      next: 'Next',
      done: 'Done',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      offline: 'Offline',
      retry: 'Retry',
    },

    // Login Screen
    login: {
      title: 'Sports Integrity',
      subtitle: 'AI-Powered Exercise Analysis',
      appName: 'SI Analytics',
      athleteNameLabel: 'Athlete Name',
      athleteNamePlaceholder: 'Enter your name',
      backendUrlLabel: 'Backend Server URL',
      backendUrlPlaceholder: 'http://192.168.1.100:8000',
      helpLink: 'Need help? 📡',
      continueButton: 'Continue',
      connecting: 'Connecting...',
      footer: 'Record exercises with AI-powered integrity verification',
      errorEmptyName: 'Please enter athlete name',
      connectionWarning: 'Connection Warning',
      connectionMessage: 'Cannot connect to backend server. You can still record videos locally and sync later.',
      continueOffline: 'Continue Offline',
      checkSettings: 'Check Settings',
      loginError: 'Failed to save settings. Please try again.',
    },

    // Test Select Screen
    testSelect: {
      welcomeTitle: 'Welcome, {name}',
      subtitle: 'Select Exercise Type',
      instructions: 'Choose the exercise you want to record and analyze:',
      pushupTitle: 'Push-ups',
      pushupDescription: 'Upper body strength test with form analysis',
      situpTitle: 'Sit-ups',
      situpDescription: 'Core strength test with form analysis',
      recordingTips: 'ℹ️ Recording Tips',
      footer: '🎯 AI will analyze your form, count repetitions, and verify integrity',
    },

    // Record Screen
    record: {
      title: 'Record {exercise}',
      titlePushup: 'Record Push-ups',
      titleSitup: 'Record Sit-ups',
      athleteSubtitle: 'Athlete: {name}',
      instructionsTitle: 'Recording Instructions:',
      instructions: '• Position camera at side angle (profile view)\n• Ensure full body is visible in frame\n• Use good lighting with minimal shadows\n• Keep camera steady throughout recording\n• Perform 5-10 repetitions at normal speed\n• Keep your face visible for identity verification',
      startRecording: '📹 Start Recording',
      recording: '🔴 Recording...',
      videoRecorded: '✅ Video Recorded',
      uploadingAnalyzing: 'Uploading and Analyzing... {progress}%',
      syncPending: '📤 Sync Pending',
      viewResults: '📊 View Results',
      footer: '💡 Videos are saved locally and can be uploaded when connection is available',
      pickVideoFile: 'Pick Video File',
      generateTestVideo: 'Generate Test Video',
      videoSelected: 'Video Selected',
      uploadNow: 'Upload Now',
      uploadLater: 'Upload Later',
      generateTestTitle: 'Generate Test Video',
      generateTestMessage: 'This would create a synthetic test video using the test video generator from the overlay module. In the actual implementation, this would call the Python script to generate a test video.',
      uploadSuccessful: 'Upload Successful!',
      viewResultsPrompt: 'Your video has been analyzed. View results?',
      uploadFailed: 'Upload Failed',
      uploadError: 'Failed to upload video. Please try again.',
      noPendingUploads: 'No Pending Uploads',
      allSynced: 'All videos are already synced.',
      syncPendingPrompt: 'You have {count} unsynced videos. Upload them now?',
      syncNow: 'Sync Now',
      syncComplete: 'Sync Complete',
      syncResults: 'Successfully uploaded: {successful}\nFailed: {failed}',
      syncError: 'Failed to sync uploads',
    },

    // Results Screen
    results: {
      title: 'Analysis Results',
      repsLabel: 'Total Reps',
      validRepsLabel: 'Valid Reps',
      postureScoreLabel: 'Posture Score',
      integrityCheckLabel: 'Integrity Check',
      passed: '🟢 Passed',
      failed: '🔴 Failed',
      good: '🟢 Good',
      fair: '🟡 Fair',
      poor: '🔴 Poor',
      efficiency: '{percent}% efficiency',
      issuesDetected: 'Issues detected',
      noIssues: 'No issues',
      integrityIssues: '⚠️ Integrity issues detected:',
      noIntegrityIssues: '✅ No integrity issues detected',
      frameDuplication: '📹 Excessive frame duplication detected - possible video tampering',
      faceInconsistency: '👤 Face position inconsistency - possible identity switching',
      excessiveRepRate: '⚡ Unphysiological repetition rate - possible speed manipulation',
      technicalDetails: 'Technical Details',
      downloadOriginal: '📹 Download Original',
      downloadOverlay: '🎯 Download Overlay',
      generateOverlay: '🎯 Generate Overlay',
      viewFrameAnalysis: '🔍 Frame Analysis',
      exportReport: '📄 Export Report',
    },

    // Video Recorder
    videoRecorder: {
      guidancePushup: 'Place phone 1.5m away • Keep full body in frame • Side angle view for push-ups',
      guidanceSitup: 'Place phone 1.5m away • Keep full body in frame • Side angle view for sit-ups',
      startRecording: 'Start recording',
      stopRecording: 'Stop recording',
      recordingTime: 'Recording for {time}. Tap to stop.',
      startPrompt: 'Tap to start recording {exercise} exercise',
    },

    // Offline Banner
    offline: {
      offline: 'Offline',
      queued: 'Offline • {count} queued',
      pendingUploads: '{count} pending upload{plural}',
      tapToSync: 'Tap to sync',
      offlineMessage: 'You are offline with {count} videos queued for upload',
      currentlyOffline: 'You are currently offline',
      pendingMessage: '{count} video{plural} pending upload',
    },

    // Help Content
    help: {
      networkTitle: 'Backend URL Help',
      networkMessage: 'Enter the IP address of your computer running the backend server.\n\nExample: http://192.168.1.100:8000\n\nMake sure your phone and computer are on the same WiFi network.\n\nTo find your computer\'s IP:\n• Windows: ipconfig\n• Mac/Linux: ifconfig or ip addr',
      
      pushupTitle: 'Push-up Test',
      pushupInstructions: 'Record yourself doing push-ups from a side angle.\n\n• Position camera to show your full body profile\n• Ensure good lighting with minimal shadows\n• Maintain steady camera position\n• Perform 5-10 repetitions at normal speed\n• Keep your face visible for verification',
      
      situpTitle: 'Sit-up Test',
      situpInstructions: 'Record yourself doing sit-ups from a side angle.\n\n• Position camera to show your full body profile\n• Ensure good lighting with minimal shadows\n• Keep legs bent at knees (traditional sit-up position)\n• Perform 5-10 repetitions at normal speed\n• Keep your face visible for verification',
    },

    // Accessibility
    accessibility: {
      goBack: 'Go back',
      showHelp: 'Show help',
      openHelpDialog: 'Opens help dialog',
      changeLanguage: 'Change language',
      recordingTimeAnnouncement: 'Recording time: {current} of {max}',
    },
  },

  hi: {
    // Common
    common: {
      continue: 'जारी रखें',
      cancel: 'रद्द करें',
      ok: 'ठीक है',
      back: 'वापस',
      next: 'अगला',
      done: 'पूर्ण',
      loading: 'लोड हो रहा है...',
      error: 'त्रुटि',
      success: 'सफलता',
      warning: 'चेतावनी',
      offline: 'ऑफ़लाइन',
      retry: 'पुनः प्रयास',
    },

    // Login Screen
    login: {
      title: 'खेल सत्यनिष्ठा',
      subtitle: 'AI-संचालित व्यायाम विश्लेषण',
      appName: 'SI Analytics',
      athleteNameLabel: 'खिलाड़ी का नाम',
      athleteNamePlaceholder: 'अपना नाम दर्ज करें',
      backendUrlLabel: 'बैकएंड सर्वर URL',
      backendUrlPlaceholder: 'http://192.168.1.100:8000',
      helpLink: 'सहायता चाहिए? 📡',
      continueButton: 'जारी रखें',
      connecting: 'कनेक्ट हो रहा है...',
      footer: 'AI-संचालित सत्यनिष्ठा सत्यापन के साथ व्यायाम रिकॉर्ड करें',
      errorEmptyName: 'कृपया खिलाड़ी का नाम दर्ज करें',
      connectionWarning: 'कनेक्शन चेतावनी',
      connectionMessage: 'बैकएंड सर्वर से कनेक्ट नहीं हो सकता। आप अभी भी वीडियो स्थानीय रूप से रिकॉर्ड कर सकते हैं और बाद में सिंक कर सकते हैं।',
      continueOffline: 'ऑफ़लाइन जारी रखें',
      checkSettings: 'सेटिंग्स जांचें',
      loginError: 'सेटिंग्स सहेजने में विफल। कृपया पुनः प्रयास करें।',
    },

    // Test Select Screen
    testSelect: {
      welcomeTitle: 'स्वागत, {name}',
      subtitle: 'व्यायाम प्रकार चुनें',
      instructions: 'रिकॉर्ड और विश्लेषण के लिए व्यायाम चुनें:',
      pushupTitle: 'पुश-अप्स',
      pushupDescription: 'रूप विश्लेषण के साथ ऊपरी शरीर की शक्ति परीक्षा',
      situpTitle: 'सिट-अप्स',
      situpDescription: 'रूप विश्लेषण के साथ मुख्य शक्ति परीक्षा',
      recordingTips: 'ℹ️ रिकॉर्डिंग सुझाव',
      footer: '🎯 AI आपके रूप का विश्लेषण करेगा, दोहराव गिनेगा, और सत्यनिष्ठा सत्यापित करेगा',
    },

    // Record Screen
    record: {
      title: '{exercise} रिकॉर्ड करें',
      titlePushup: 'पुश-अप्स रिकॉर्ड करें',
      titleSitup: 'सिट-अप्स रिकॉर्ड करें',
      athleteSubtitle: 'खिलाड़ी: {name}',
      instructionsTitle: 'रिकॉर्डिंग निर्देश:',
      instructions: '• कैमरा को साइड एंगल (प्रोफाइल व्यू) पर रखें\n• सुनिश्चित करें कि पूरा शरीर फ्रेम में दिखाई दे\n• अच्छी रोशनी का उपयोग करें, कम छाया के साथ\n• रिकॉर्डिंग के दौरान कैमरा स्थिर रखें\n• सामान्य गति से 5-10 दोहराव करें\n• पहचान सत्यापन के लिए चेहरा दिखाई देता रहे',
      startRecording: '📹 रिकॉर्डिंग शुरू करें',
      recording: '🔴 रिकॉर्डिंग...',
      videoRecorded: '✅ वीडियो रिकॉर्ड हुआ',
      uploadingAnalyzing: 'अपलोड और विश्लेषण... {progress}%',
      syncPending: '📤 सिंक लंबित',
      viewResults: '📊 परिणाम देखें',
      footer: '💡 वीडियो स्थानीय रूप से सहेजे जाते हैं और कनेक्शन उपलब्ध होने पर अपलोड किए जा सकते हैं',
      pickVideoFile: 'वीडियो फ़ाइल चुनें',
      generateTestVideo: 'टेस्ट वीडियो जेनरेट करें',
      videoSelected: 'वीडियो चुना गया',
      uploadNow: 'अभी अपलोड करें',
      uploadLater: 'बाद में अपलोड करें',
      generateTestTitle: 'टेस्ट वीडियो जेनरेट करें',
      generateTestMessage: 'यह ओवरले मॉड्यूल से टेस्ट वीडियो जेनरेटर का उपयोग करके एक सिंथेटिक टेस्ट वीडियो बनाएगा। वास्तविक कार्यान्वयन में, यह टेस्ट वीडियो बनाने के लिए Python स्क्रिप्ट को कॉल करेगा।',
      uploadSuccessful: 'अपलोड सफल!',
      viewResultsPrompt: 'आपके वीडियो का विश्लेषण हो गया है। परिणाम देखें?',
      uploadFailed: 'अपलोड विफल',
      uploadError: 'वीडियो अपलोड करने में विफल। कृपया पुनः प्रयास करें।',
      noPendingUploads: 'कोई लंबित अपलोड नहीं',
      allSynced: 'सभी वीडियो पहले से सिंक हैं।',
      syncPendingPrompt: 'आपके पास {count} बिना सिंक किए वीडियो हैं। अभी अपलोड करें?',
      syncNow: 'अभी सिंक करें',
      syncComplete: 'सिंक पूर्ण',
      syncResults: 'सफलतापूर्वक अपलोड: {successful}\nविफल: {failed}',
      syncError: 'अपलोड सिंक करने में विफल',
    },

    // Results Screen (abbreviated for brevity - full translations would continue)
    results: {
      title: 'विश्लेषण परिणाम',
      repsLabel: 'कुल दोहराव',
      validRepsLabel: 'वैध दोहराव',
      postureScoreLabel: 'मुद्रा स्कोर',
      integrityCheckLabel: 'सत्यनिष्ठा जांच',
      passed: '🟢 उत्तीर्ण',
      failed: '🔴 असफल',
      good: '🟢 अच्छा',
      fair: '🟡 ठीक',
      poor: '🔴 खराब',
    },

    // Additional Hindi translations would continue...
    // For brevity, showing key sections only
  },
};

// Type for translation keys (for TypeScript support)
type TranslationKey = string;

class I18nService {
  private currentLanguage: Language = 'en';

  async initialize(): Promise<void> {
    // Simple in-memory storage for demo
    // In production, would use AsyncStorage or similar
    console.log('I18n initialized with language:', this.currentLanguage);
  }

  async setLanguage(language: Language): Promise<void> {
    this.currentLanguage = language;
    console.log('Language changed to:', language);
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  // Get translation with parameter substitution
  t(key: string, params?: Record<string, string | number>): string {
    const keys = key.split('.');
    let value: any = translations[this.currentLanguage];

    // Navigate through nested keys
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        console.warn(`Translation key not found: ${key}`);
        return key; // Return key as fallback
      }
    }

    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string: ${key}`);
      return key;
    }

    // Parameter substitution
    if (params) {
      return Object.entries(params).reduce((str, [param, val]) => {
        return str.replace(new RegExp(`\\{${param}\\}`, 'g'), String(val));
      }, value);
    }

    return value;
  }

  // Plural helper
  plural(count: number, singular: string, plural?: string): string {
    if (count === 1) return singular;
    return plural || singular + 's';
  }
}

// Create singleton instance
export const i18n = new I18nService();

// React hook for using translations
export const useTranslation = () => {
  const [language, setLanguageState] = useState<Language>(i18n.getCurrentLanguage());

  const changeLanguage = async (newLanguage: Language) => {
    await i18n.setLanguage(newLanguage);
    setLanguageState(newLanguage);
  };

  return {
    t: i18n.t.bind(i18n),
    language,
    changeLanguage,
  };
};

export default i18n;