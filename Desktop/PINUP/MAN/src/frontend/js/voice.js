/**
 * VoiceModule - Provides simple voice alerts using Web Speech API
 * Allows the application to speak important messages, such as out-of-range glucose readings.
 */

const VoiceModule = {
  /**
   * Speak the provided text using the browser\'s speech synthesis.
   * @param {string} text - The text to vocalize.
   */
  speak(text) {
    if (!('speechSynthesis' in window)) {
      console.warn('Web Speech API not supported in this browser.');
      return;
    }

    try {
      // Cancel any ongoing speeches to avoid overlap
      window.speechSynthesis.cancel();

      // Ensure voices are loaded (some browsers need async loading)
      const availableVoices = window.speechSynthesis.getVoices();
      const voice = availableVoices.find(v => v.lang.startsWith('en')) || null;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      if (voice) {
        utterance.voice = voice;
      }
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Voice synthesis error:', error);
    }
  },
};

// Helper: load voices list early
(function initVoiceModule(){
  function loadVoices(){
    // Trigger getVoices so browser populates voice list
    window.speechSynthesis.getVoices();
  }
  loadVoices();
  if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined'){
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
})();

// Expose globally for convenience
window.VoiceModule = VoiceModule;

// Notify that the module is ready
document.dispatchEvent(new CustomEvent('voicemodule-ready'));