export type Locale = "en" | "fr" | "es" | "pt";

export interface Dictionary {
  // Common
  appName: string;
  save: string;
  cancel: string;
  delete: string;
  close: string;
  loading: string;
  error: string;
  success: string;

  // Auth
  login: string;
  signup: string;
  signOut: string;
  email: string;
  sendMagicLink: string;
  checkEmail: string;
  welcomeBack: string;
  noAccount: string;
  haveAccount: string;
  orContinueWith: string;
  createAccount: string;
  sending: string;

  // Dashboard
  welcomeBackUser: string;
  dashboardOverview: string;
  createNewSheet: string;
  importSheet: string;
  totalSheets: string;
  recentExports: string;
  shared: string;
  recentSheets: string;
  noSheetsYet: string;
  createFirstSheet: string;
  newSheet: string;
  createSheet: string;
  deleteConfirm: string;
  justNow: string;
  minutesAgo: string;
  hoursAgo: string;
  daysAgo: string;

  // Navigation
  dashboard: string;
  mySheets: string;
  settings: string;

  // Editor
  songTitle: string;
  artist: string;
  key: string;
  bpm: string;
  time: string;
  youtubeUrl: string;
  saving: string;
  saved: string;
  unsaved: string;
  startTyping: string;
  insertChord: string;
  addSection: string;
  transposeUp: string;
  transposeDown: string;
  focusMode: string;
  undo: string;
  redo: string;
  editChord: string;
  removeChord: string;
  shareSheet: string;

  // Export
  exportSheet: string;
  format: string;
  pageSize: string;
  columns: string;
  column: string;
  content: string;
  full: string;
  chordsOnly: string;
  lyricsOnly: string;
  fontSize: string;
  compact: string;
  standard: string;
  readable: string;
  exporting: string;

  // Import
  importSheetTitle: string;
  pasteOrUpload: string;
  pasteLyrics: string;
  uploadFile: string;
  dropFileHere: string;
  orClickToUpload: string;
  preview: string;
  importButton: string;
  importing: string;
  enhanceWithAI: string;
  analyzing: string;
  noContentDetected: string;
  sectionsDetected: string;

  // Settings
  settingsTitle: string;
  managePreferences: string;
  displayName: string;
  yourName: string;
  notationPreference: string;
  notationHelp: string;
  theme: string;
  language: string;
  languageHelp: string;
  aiAssistant: string;
  aiEnabled: string;
  aiProvider: string;
  aiApiKey: string;
  aiModel: string;
  testConnection: string;
  connectionSuccess: string;
  connectionFailed: string;
  saveChanges: string;
  settingsSaved: string;
  settingsFailed: string;

  // Performance mode
  performanceMode: string;
  autoScroll: string;
  scrollSpeed: string;
  slow: string;
  medium: string;
  fast: string;
  startPerformance: string;
  stopPerformance: string;

  // Music features
  capo: string;
  capoFret: string;
  noCapo: string;
  detectKey: string;
  detectedKey: string;
  chordDiagrams: string;
  showDiagrams: string;
  instrument: string;
  guitar: string;
  ukulele: string;
  piano: string;

  // Metronome
  metronome: string;
  startMetronome: string;
  stopMetronome: string;
  tapTempo: string;
  beatsPerMeasure: string;

  // Organization
  search: string;
  searchSheets: string;
  searchPlaceholder: string;
  noResults: string;
  favorites: string;
  addToFavorites: string;
  removeFromFavorites: string;
  tags: string;
  addTag: string;
  removeTag: string;
  tagName: string;
  tagColor: string;
  folders: string;
  newFolder: string;
  folderName: string;
  moveToFolder: string;
  allSheets: string;
  setlists: string;
  createSetlist: string;
  setlistName: string;
  setlistDescription: string;
  addToSetlist: string;
  removeFromSetlist: string;
  setlistEmpty: string;
  reorderSetlist: string;

  // Sharing
  qrCode: string;
  generateQR: string;
  scanToView: string;
  copyLink: string;
  linkCopied: string;

  // Export extras
  exportAsImage: string;
  exportMIDI: string;

  // UX
  zoomIn: string;
  zoomOut: string;
  resetZoom: string;
  versionHistory: string;
  restoreVersion: string;
  versionRestored: string;
  currentVersion: string;
  previousVersions: string;

  // AI features
  generateLyrics: string;
  suggestChords: string;
  alternativeProgressions: string;
  musicalAnalysis: string;
  analyzeHarmony: string;
  harmonicAnalysis: string;
  suggestAlternatives: string;

  // Comments
  comments: string;
  addComment: string;
  deleteComment: string;
  noComments: string;
  commentPlaceholder: string;

  // Import extras
  importFromUrl: string;
  pasteUrl: string;

  // YouTube
  youtubePlayer: string;

  // Collaboration
  collaborators: string;

  // New languages
  spanish: string;
  portuguese: string;
}
