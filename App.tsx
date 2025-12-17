import React, { useState, useMemo, useRef, useEffect } from 'react'
import {
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
  Alert,
  View,
  TouchableOpacity,
  Animated,
  PanResponder,
  Vibration,
} from 'react-native'
import {
  Provider as PaperProvider,
  MD3LightTheme as DefaultTheme,
  MD3DarkTheme as DarkTheme,
  configureFonts,
  Card,
  Text,
  Button,
  TextInput,
  Chip,
  Switch,
  Divider,
  Surface,
  Badge,
  Snackbar,
  SegmentedButtons,
} from 'react-native-paper'

// PWA Installation TypeScript types
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

// Define TypeScript types
type MoodType = {
  id: string
  emoji: string
  label: string
  value: number
  color: string
}

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night'

type LogEntryType = {
  id: string
  mood: MoodType
  note: string
  tags: string[]
  timeOfDay: TimeOfDay
  timestamp: Date
}

type JournalEntryType = {
  id: string
  date: string
  prompt: string
  gratitude: string[]
  reflection: string
}

// Create custom themes
const CustomLightTheme = {
  ...DefaultTheme,
  roundness: 16,
  colors: {
    ...DefaultTheme.colors,
    primary: '#0891b2',
    accent: '#8b5cf6',
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#0f172a',
    disabled: '#cbd5e1',
    placeholder: '#64748b',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    notification: '#f43f5e',
    card: '#ffffff',
    border: '#e2e8f0',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    onSurface: '#0f172a',
    surfaceVariant: '#f1f5f9',
  },
  fonts: configureFonts({
    config: {
      fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
  }),
}

const CustomDarkTheme = {
  ...DarkTheme,
  roundness: 16,
  colors: {
    ...DarkTheme.colors,
    primary: '#06b6d4',
    accent: '#a78bfa',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    disabled: '#475569',
    placeholder: '#94a3b8',
    backdrop: 'rgba(0, 0, 0, 0.7)',
    notification: '#fb7185',
    card: '#334155',
    border: '#475569',
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
    info: '#60a5fa',
    onSurface: '#f1f5f9',
    surfaceVariant: '#334155',
  },
  fonts: configureFonts({
    config: {
      fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
  }),
}

// Available moods
const MOODS: MoodType[] = [
  { id: '1', emoji: '😢', label: 'Terrible', value: 1, color: '#ef4444' },
  { id: '2', emoji: '😐', label: 'Meh', value: 2, color: '#f59e0b' },
  { id: '3', emoji: '🙂', label: 'Okay', value: 3, color: '#eab308' },
  { id: '4', emoji: '😊', label: 'Good', value: 4, color: '#22c55e' },
  { id: '5', emoji: '🤩', label: 'Excellent', value: 5, color: '#8b5cf6' },
]

// Predefined tags
const DEFAULT_TAGS = [
  'stressful',
  'productive',
  'social',
  'tired',
  'creative',
  'exercise',
  'family',
  'work',
  'relaxed',
  'anxious',
  'happy',
  'sad',
]

// Daily journal prompts
const DAILY_PROMPTS = [
  "What's one thing you're grateful for today?",
  'What made you smile today?',
  'What did you learn about yourself today?',
  'How did you practice self-care today?',
]

// PWA Installation Button Component
const PWAInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    const checkDisplayMode = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
      setIsStandalone(isStandalone)
    }

    checkDisplayMode()

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallButton(true)
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setShowInstallButton(false)
      setIsStandalone(true)
      console.log('PWA was installed')
    }

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Check on display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches)
    }
    mediaQuery.addEventListener('change', handleDisplayModeChange)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      mediaQuery.removeEventListener('change', handleDisplayModeChange)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()

    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
      // You can add haptic feedback here if on mobile web
      if (navigator.vibrate) {
        navigator.vibrate(100)
      }
    } else {
      console.log('User dismissed the install prompt')
    }

    setDeferredPrompt(null)
    setShowInstallButton(false)
  }

  // Don't show install button if already installed or on native platforms
  if (isStandalone || Platform.OS !== 'web' || !showInstallButton) return null

  return (
    <View style={styles.pwaInstallContainer}>
      <Surface style={styles.pwaInstallBanner} elevation={2}>
        <View style={styles.pwaInstallContent}>
          <Text style={styles.pwaInstallIcon}>📱</Text>
          <View style={styles.pwaInstallText}>
            <Text style={styles.pwaInstallTitle}>Install MoodFlow App</Text>
            <Text style={styles.pwaInstallSubtitle}>Get the full app experience</Text>
          </View>
          <Button
            mode="contained"
            onPress={handleInstallClick}
            style={styles.pwaInstallButton}
            compact
          >
            Install
          </Button>
          <Button
            mode="text"
            onPress={() => setShowInstallButton(false)}
            style={styles.pwaDismissButton}
            compact
          >
            ✕
          </Button>
        </View>
      </Surface>
    </View>
  )
}

// Mood Button Component
const MoodButton = ({ mood, isSelected, onPress, theme }: any) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start()
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.moodButtonWrapper,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View
          style={[
            styles.moodButton,
            {
              backgroundColor: isSelected ? `${mood.color}20` : theme.colors.surfaceVariant,
              borderWidth: isSelected ? 2 : 0,
              borderColor: mood.color,
            },
          ]}
        >
          <Text style={styles.moodEmoji}>{mood.emoji}</Text>
        </View>
        <Text
          style={[styles.moodLabel, { color: isSelected ? mood.color : theme.colors.placeholder }]}
        >
          {mood.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  )
}

// Swipeable Log Entry Component
const SwipeableLogEntry = ({ log, onDelete, theme, formatTimestamp }: any) => {
  const translateX = useRef(new Animated.Value(0)).current
  const deleteThreshold = -100

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return (
          Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy)
        )
      },
      onPanResponderGrant: () => {
        translateX.setOffset(0)
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(gestureState.dx)
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx < deleteThreshold) {
          handleDelete()
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 10,
          }).start()
        }
      },
    }),
  ).current

  const handleDelete = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Vibration.vibrate(50)
    } else if (navigator.vibrate) {
      navigator.vibrate(50)
    }

    Animated.timing(translateX, {
      toValue: -500,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onDelete(log.id)
    })
  }

  const deleteButtonOpacity = translateX.interpolate({
    inputRange: [-100, -50, 0],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  })

  return (
    <View style={styles.swipeableContainer}>
      {/* Delete Background */}
      <View style={styles.deleteBackground}>
        <Animated.View style={[styles.deleteIconContainer, { opacity: deleteButtonOpacity }]}>
          <Text style={styles.deleteIcon}>🗑️</Text>
          <Text style={styles.deleteText}>Delete</Text>
        </Animated.View>
      </View>

      {/* Swipeable Entry */}
      <Animated.View
        style={[
          styles.swipeableEntry,
          {
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Surface
          style={[
            styles.logEntry,
            {
              backgroundColor: theme.colors.card,
              borderLeftColor: log.mood.color,
            },
          ]}
        >
          <View style={styles.logContent}>
            <View style={styles.logHeader}>
              <View style={styles.logMoodHeader}>
                <Text style={styles.logEmoji}>{log.mood.emoji}</Text>
                <Text style={[styles.logTitle, { color: theme.colors.text }]}>
                  {log.mood.label}
                </Text>
              </View>
              <Text style={[styles.logTimestamp, { color: theme.colors.placeholder }]}>
                {formatTimestamp(log.timestamp)}
              </Text>
            </View>

            {log.note ? (
              <>
                <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                <Text style={[styles.logNote, { color: theme.colors.text }]}>{log.note}</Text>
              </>
            ) : null}

            {log.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {log.tags.map((tag: string) => (
                  <Chip key={tag} mode="outlined" style={styles.tagChip}>
                    #{tag}
                  </Chip>
                ))}
              </View>
            )}
          </View>
        </Surface>
      </Animated.View>
    </View>
  )
}

// Main App Component
function MainApp() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [activeTab, setActiveTab] = useState<'home' | 'journal'>('home')
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null)
  const [note, setNote] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState('')
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('afternoon')
  const [logs, setLogs] = useState<LogEntryType[]>([])
  const [journalEntries, setJournalEntries] = useState<JournalEntryType[]>([])
  const [gratitude, setGratitude] = useState(['', '', ''])
  const [reflection, setReflection] = useState('')
  const [todayPrompt] = useState(DAILY_PROMPTS[Math.floor(Math.random() * DAILY_PROMPTS.length)])
  const [snackbarVisible, setSnackbarVisible] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [deletedLog, setDeletedLog] = useState<LogEntryType | null>(null)

  const theme = isDarkMode ? CustomDarkTheme : CustomLightTheme

  // PWA: Check if we're online
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleLogMood = () => {
    if (!selectedMood) {
      showSnackbar('Please select a mood first')
      return
    }

    const newLog: LogEntryType = {
      id: `log-${Date.now()}`,
      mood: selectedMood,
      note: note.trim(),
      tags: selectedTags,
      timeOfDay,
      timestamp: new Date(),
    }

    setLogs((prev) => [newLog, ...prev])

    // Save to localStorage for PWA offline persistence
    if (Platform.OS === 'web') {
      try {
        const savedLogs = JSON.parse(localStorage.getItem('moodflow_logs') || '[]')
        savedLogs.unshift({
          ...newLog,
          timestamp: newLog.timestamp.toISOString(),
        })
        localStorage.setItem('moodflow_logs', JSON.stringify(savedLogs.slice(0, 100))) // Keep last 100
      } catch (error) {
        console.error('Failed to save to localStorage:', error)
      }
    }

    setSelectedMood(null)
    setNote('')
    setSelectedTags([])
    setCustomTag('')

    showSnackbar(`${selectedMood.emoji} Mood logged successfully!`)
  }

  // Load logs from localStorage on PWA
  useEffect(() => {
    if (Platform.OS === 'web') {
      try {
        const savedLogs = JSON.parse(localStorage.getItem('moodflow_logs') || '[]')
        if (savedLogs.length > 0) {
          const parsedLogs = savedLogs.map((log: any) => ({
            ...log,
            timestamp: new Date(log.timestamp),
            mood: MOODS.find((m) => m.id === log.mood?.id) || MOODS[2],
          }))
          setLogs(parsedLogs.slice(0, 50))
        }
      } catch (error) {
        console.error('Failed to load from localStorage:', error)
      }
    }
  }, [])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const addCustomTag = () => {
    const trimmed = customTag.trim().toLowerCase()
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags((prev) => [...prev, trimmed])
      setCustomTag('')
    }
  }

  const deleteLog = (logId: string) => {
    const logToDelete = logs.find((log) => log.id === logId)
    if (logToDelete) {
      setDeletedLog(logToDelete)
      setLogs((prev) => prev.filter((log) => log.id !== logId))

      // Remove from localStorage
      if (Platform.OS === 'web') {
        try {
          const savedLogs = JSON.parse(localStorage.getItem('moodflow_logs') || '[]')
          const updatedLogs = savedLogs.filter((log: any) => log.id !== logId)
          localStorage.setItem('moodflow_logs', JSON.stringify(updatedLogs))
        } catch (error) {
          console.error('Failed to update localStorage:', error)
        }
      }

      showSnackbar('Entry deleted')
    }
  }

  const handleUndo = () => {
    if (deletedLog) {
      setLogs((prev) => {
        const newLogs = [...prev]
        let insertIndex = 0

        for (let i = 0; i < newLogs.length; i++) {
          if (deletedLog.timestamp > newLogs[i].timestamp) {
            insertIndex = i
            break
          }
          insertIndex = i + 1
        }

        newLogs.splice(insertIndex, 0, deletedLog)

        // Save back to localStorage
        if (Platform.OS === 'web') {
          try {
            const savedLogs = JSON.parse(localStorage.getItem('moodflow_logs') || '[]')
            savedLogs.splice(insertIndex, 0, {
              ...deletedLog,
              timestamp: deletedLog.timestamp.toISOString(),
            })
            localStorage.setItem('moodflow_logs', JSON.stringify(savedLogs))
          } catch (error) {
            console.error('Failed to undo in localStorage:', error)
          }
        }

        return newLogs
      })
      setDeletedLog(null)
      setSnackbarVisible(false)
    }
  }

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message)
    setSnackbarVisible(true)
  }

  const handleSnackbarDismiss = () => {
    setSnackbarVisible(false)
    setDeletedLog(null)
  }

  const stats = useMemo(() => {
    if (logs.length === 0) {
      return {
        totalEntries: 0,
        positivePercentage: 0,
        currentStreak: 0,
        averageMood: 0,
      }
    }

    const positiveEntries = logs.filter((log) => log.mood.value >= 4).length
    const positivePercentage = Math.round((positiveEntries / logs.length) * 100)

    let currentStreak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const sortedLogs = [...logs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    for (let i = 0; i < sortedLogs.length; i++) {
      const logDate = new Date(sortedLogs[i].timestamp)
      logDate.setHours(0, 0, 0, 0)
      const expectedDate = new Date(today)
      expectedDate.setDate(expectedDate.getDate() - currentStreak)

      if (logDate.getTime() === expectedDate.getTime()) {
        currentStreak++
      } else if (logDate.getTime() < expectedDate.getTime()) {
        break
      }
    }

    const averageMood = logs.reduce((sum, log) => sum + log.mood.value, 0) / logs.length

    return {
      totalEntries: logs.length,
      positivePercentage,
      currentStreak,
      averageMood: Math.round(averageMood * 10) / 10,
    }
  }, [logs])

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const logDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    const timeStr = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })

    if (logDate.getTime() === today.getTime()) {
      return `Today, ${timeStr}`
    }

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (logDate.getTime() === yesterday.getTime()) {
      return `Yesterday, ${timeStr}`
    }

    const dateStr = date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    })

    return `${dateStr}, ${timeStr}`
  }

  const saveJournalEntry = () => {
    const entry: JournalEntryType = {
      id: `journal-${Date.now()}`,
      date: new Date().toISOString(),
      prompt: todayPrompt,
      gratitude: gratitude.filter((g) => g.trim()),
      reflection: reflection.trim(),
    }

    setJournalEntries((prev) => [entry, ...prev])
    setGratitude(['', '', ''])
    setReflection('')

    // Save to localStorage for PWA
    if (Platform.OS === 'web') {
      try {
        const savedEntries = JSON.parse(localStorage.getItem('moodflow_journal') || '[]')
        savedEntries.unshift(entry)
        localStorage.setItem('moodflow_journal', JSON.stringify(savedEntries.slice(0, 50)))
      } catch (error) {
        console.error('Failed to save journal:', error)
      }
    }

    showSnackbar('📝 Journal entry saved!')
  }

  // Load journal entries from localStorage
  useEffect(() => {
    if (Platform.OS === 'web') {
      try {
        const savedEntries = JSON.parse(localStorage.getItem('moodflow_journal') || '[]')
        if (savedEntries.length > 0) {
          setJournalEntries(savedEntries.slice(0, 20))
        }
      } catch (error) {
        console.error('Failed to load journal:', error)
      }
    }
  }, [])

  const renderScreen = () => {
    if (activeTab === 'journal') {
      return (
        <ScrollView style={{ backgroundColor: theme.colors.background }}>
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                📝 Daily Journal
              </Text>

              <Text style={[styles.prompt, { color: theme.colors.primary }]}>{todayPrompt}</Text>

              <Text style={[styles.subsectionTitle, { color: theme.colors.text }]}>
                ✨ 3 Good Things
              </Text>
              {[0, 1, 2].map((index) => (
                <TextInput
                  key={index}
                  label={`Good thing ${index + 1}`}
                  value={gratitude[index]}
                  onChangeText={(text) => {
                    const newGratitude = [...gratitude]
                    newGratitude[index] = text
                    setGratitude(newGratitude)
                  }}
                  mode="outlined"
                  style={styles.input}
                  outlineColor={theme.colors.border}
                  activeOutlineColor={theme.colors.primary}
                />
              ))}

              <Text style={[styles.subsectionTitle, { color: theme.colors.text }]}>
                💭 Free Reflection
              </Text>
              <TextInput
                label="Write anything on your mind..."
                value={reflection}
                onChangeText={setReflection}
                mode="outlined"
                multiline
                numberOfLines={4}
                style={styles.input}
                outlineColor={theme.colors.border}
                activeOutlineColor={theme.colors.primary}
              />

              <Button
                mode="contained"
                onPress={saveJournalEntry}
                style={styles.saveButton}
                icon="content-save"
              >
                Save Journal Entry
              </Button>
            </Card.Content>
          </Card>

          {journalEntries.map((entry) => (
            <Card key={entry.id} style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Card.Content>
                <Text style={[styles.entryDate, { color: theme.colors.placeholder }]}>
                  {new Date(entry.date).toLocaleDateString()}
                </Text>
                <Text style={[styles.entryPrompt, { color: theme.colors.text }]}>
                  {entry.prompt}
                </Text>
                {entry.gratitude.length > 0 && (
                  <>
                    <Text style={[styles.subsectionTitle, { color: theme.colors.text }]}>
                      What I'm grateful for:
                    </Text>
                    {entry.gratitude.map((item, idx) => (
                      <Text key={idx} style={[styles.gratitudeItem, { color: theme.colors.text }]}>
                        • {item}
                      </Text>
                    ))}
                  </>
                )}
                {entry.reflection && (
                  <>
                    <Text style={[styles.subsectionTitle, { color: theme.colors.text }]}>
                      Reflection:
                    </Text>
                    <Text style={[styles.reflectionText, { color: theme.colors.text }]}>
                      {entry.reflection}
                    </Text>
                  </>
                )}
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      )
    }

    // Home screen
    return (
      <ScrollView style={{ backgroundColor: theme.colors.background }}>
        {/* PWA Offline Indicator */}
        {Platform.OS === 'web' && !isOnline && (
          <Surface style={styles.offlineIndicator} elevation={1}>
            <Text style={styles.offlineText}>
              🌐 Offline Mode - Your data will sync when back online
            </Text>
          </Surface>
        )}

        {/* Statistics Grid */}
        <View style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>📊 Insights</Text>
          <View style={styles.statsGrid}>
            <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content style={styles.statContent}>
                <Text style={styles.statIcon}>📅</Text>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {stats.totalEntries}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.placeholder }]}>
                  Total Entries
                </Text>
              </Card.Content>
            </Card>

            <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content style={styles.statContent}>
                <Text style={styles.statIcon}>❤️</Text>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {stats.positivePercentage}%
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.placeholder }]}>
                  Positive
                </Text>
              </Card.Content>
            </Card>

            <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content style={styles.statContent}>
                <Text style={styles.statIcon}>🔥</Text>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {stats.currentStreak}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.placeholder }]}>
                  Day Streak
                </Text>
              </Card.Content>
            </Card>

            <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content style={styles.statContent}>
                <Text style={styles.statIcon}>📈</Text>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {stats.averageMood.toFixed(1)}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.placeholder }]}>
                  Avg. Mood
                </Text>
              </Card.Content>
            </Card>
          </View>
        </View>

        {/* Mood Logging Card */}
        <Card style={[styles.moodCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              😊 How are you feeling?
            </Text>

            {/* Mood Selection Buttons */}
            <View style={styles.moodButtonsContainer}>
              {MOODS.map((mood) => (
                <MoodButton
                  key={mood.id}
                  mood={mood}
                  isSelected={selectedMood?.id === mood.id}
                  onPress={() => setSelectedMood(mood)}
                  theme={theme}
                />
              ))}
            </View>

            {/* Time of Day */}
            <Text style={[styles.subsectionTitle, { color: theme.colors.text }]}>
              ⏰ Time of Day
            </Text>
            <View style={styles.timeOfDayContainer}>
              {[
                { value: 'morning', label: '🌅 Morning' },
                { value: 'afternoon', label: '☀️ Afternoon' },
                { value: 'evening', label: '🌆 Evening' },
                { value: 'night', label: '🌙 Night' },
              ].map((time) => (
                <TouchableOpacity
                  key={time.value}
                  onPress={() => setTimeOfDay(time.value as TimeOfDay)}
                  style={[
                    styles.timeButton,
                    {
                      backgroundColor:
                        timeOfDay === time.value
                          ? theme.colors.primary
                          : theme.colors.surfaceVariant,
                      borderColor:
                        timeOfDay === time.value ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: timeOfDay === time.value ? '#ffffff' : theme.colors.text,
                      fontSize: 12,
                      fontWeight: '500',
                    }}
                  >
                    {time.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Tags */}
            <Text style={[styles.subsectionTitle, { color: theme.colors.text }]}>
              🏷️ Tags (Optional)
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsScroll}>
              {DEFAULT_TAGS.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  onPress={() => toggleTag(tag)}
                  style={[
                    styles.tagButton,
                    {
                      backgroundColor: selectedTags.includes(tag)
                        ? theme.colors.primary
                        : theme.colors.surfaceVariant,
                      borderColor: selectedTags.includes(tag)
                        ? theme.colors.primary
                        : theme.colors.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: selectedTags.includes(tag) ? '#ffffff' : theme.colors.text,
                      fontSize: 12,
                      fontWeight: '500',
                    }}
                  >
                    #{tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.customTagContainer}>
              <TextInput
                label="Add custom tag"
                value={customTag}
                onChangeText={setCustomTag}
                style={styles.customTagInput}
                mode="outlined"
                onSubmitEditing={addCustomTag}
                outlineColor={theme.colors.border}
                activeOutlineColor={theme.colors.primary}
                right={
                  <TextInput.Icon icon="plus" onPress={addCustomTag} disabled={!customTag.trim()} />
                }
              />
            </View>

            {/* Note Input */}
            <Text style={[styles.subsectionTitle, { color: theme.colors.text }]}>
              📝 Notes (Optional)
            </Text>
            <TextInput
              placeholder="What's on your mind?"
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              maxLength={200}
              style={styles.textInput}
              mode="outlined"
              outlineColor={theme.colors.border}
              activeOutlineColor={theme.colors.primary}
            />
            <View style={styles.charCounter}>
              <Text style={[styles.charCounterText, { color: theme.colors.placeholder }]}>
                {note.length}/200 characters
              </Text>
            </View>

            {/* Submit Button */}
            <Button
              mode="contained"
              onPress={handleLogMood}
              disabled={!selectedMood}
              style={styles.logButton}
              buttonColor={theme.colors.primary}
              contentStyle={styles.logButtonContent}
              labelStyle={styles.logButtonLabel}
            >
              ✓ Log My Mood
            </Button>
          </Card.Content>
        </Card>

        {/* Recent Entries */}
        <Card style={[styles.historyCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.historyHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                🕐 Mood History
              </Text>
              <Badge size={24} style={{ backgroundColor: theme.colors.primary }}>
                {logs.length}
              </Badge>
            </View>

            {/* Swipe hint */}
            {logs.length > 0 && (
              <View style={styles.swipeHint}>
                <Text style={[styles.swipeHintText, { color: theme.colors.placeholder }]}>
                  ← Swipe left to delete
                </Text>
              </View>
            )}

            {logs.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>😢</Text>
                <Text style={[styles.emptyStateTitle, { color: theme.colors.placeholder }]}>
                  No entries yet
                </Text>
                <Text style={[styles.emptyStateText, { color: theme.colors.placeholder }]}>
                  Log your first mood to start tracking your emotional journey
                </Text>
              </View>
            ) : (
              logs
                .slice(0, 5)
                .map((log: LogEntryType) => (
                  <SwipeableLogEntry
                    key={log.id}
                    log={log}
                    onDelete={deleteLog}
                    theme={theme}
                    formatTimestamp={formatTimestamp}
                  />
                ))
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    )
  }

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
        <StatusBar
          backgroundColor={theme.colors.background}
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        />

        {/* PWA Install Banner */}
        <PWAInstallButton />

        {/* Header */}
        <Surface style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.headerContent}>
            <View>
              <Text style={[styles.headerTitle, { color: theme.colors.primary }]}>MoodFlow</Text>
              <Text style={[styles.headerSubtitle, { color: theme.colors.placeholder }]}>
                Track your emotions
              </Text>
            </View>
            <View style={styles.themeToggle}>
              <Text style={{ fontSize: 16 }}>☀️</Text>
              <Switch
                value={isDarkMode}
                onValueChange={setIsDarkMode}
                color={theme.colors.primary}
              />
              <Text style={{ fontSize: 16 }}>🌙</Text>
            </View>
          </View>
        </Surface>

        {/* Tab Navigation */}
        <Surface style={[styles.tabBar, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity
            style={[
              styles.tabItem,
              activeTab === 'home' && { backgroundColor: `${theme.colors.primary}20` },
            ]}
            onPress={() => setActiveTab('home')}
          >
            <Text
              style={[
                styles.tabLabel,
                {
                  color: activeTab === 'home' ? theme.colors.primary : theme.colors.placeholder,
                  fontWeight: activeTab === 'home' ? 'bold' : 'normal',
                },
              ]}
            >
              🏠 Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabItem,
              activeTab === 'journal' && { backgroundColor: `${theme.colors.primary}20` },
            ]}
            onPress={() => setActiveTab('journal')}
          >
            <Text
              style={[
                styles.tabLabel,
                {
                  color: activeTab === 'journal' ? theme.colors.primary : theme.colors.placeholder,
                  fontWeight: activeTab === 'journal' ? 'bold' : 'normal',
                },
              ]}
            >
              📝 Journal
            </Text>
          </TouchableOpacity>
        </Surface>

        {/* Main Content */}
        <View style={styles.content}>{renderScreen()}</View>

        {/* Undo Snackbar */}
        <Snackbar
          visible={snackbarVisible}
          onDismiss={handleSnackbarDismiss}
          duration={5000}
          action={{
            label: 'Undo',
            onPress: handleUndo,
            textColor: theme.colors.primary,
          }}
          style={{ backgroundColor: theme.colors.surface }}
        >
          <Text style={{ color: theme.colors.text }}>{snackbarMessage}</Text>
        </Snackbar>
      </SafeAreaView>
    </PaperProvider>
  )
}

// Main App Wrapper
export default function App() {
  return <MainApp />
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  // PWA Install Banner Styles
  pwaInstallContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  pwaInstallBanner: {
    backgroundColor: '#0891b2',
    padding: 12,
    borderRadius: 0,
  },
  pwaInstallContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pwaInstallIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  pwaInstallText: {
    flex: 1,
  },
  pwaInstallTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  pwaInstallSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  pwaInstallButton: {
    backgroundColor: '#ffffff',
    marginLeft: 12,
  },
  pwaDismissButton: {
    minWidth: 40,
    marginLeft: 8,
  },
  // Offline Indicator
  offlineIndicator: {
    backgroundColor: '#f59e0b',
    padding: 8,
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  offlineText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  // Original styles continue...
  header: {
    elevation: 4,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: Platform.OS === 'web' ? 48 : 0, // Space for PWA banner
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    height: 60,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  statsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 16,
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  moodCard: {
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    elevation: 3,
  },
  moodButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  moodButtonWrapper: {
    alignItems: 'center',
  },
  moodButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  moodEmoji: {
    fontSize: 28,
  },
  moodLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  timeOfDayContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  timeButton: {
    flex: 1,
    minWidth: '23%',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsScroll: {
    marginBottom: 12,
  },
  tagButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  customTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  customTagInput: {
    flex: 1,
  },
  textInput: {
    marginTop: 8,
    backgroundColor: 'transparent',
  },
  charCounter: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  charCounterText: {
    fontSize: 12,
  },
  logButton: {
    borderRadius: 16,
    marginTop: 20,
    elevation: 4,
  },
  logButtonContent: {
    paddingVertical: 10,
  },
  logButtonLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  historyCard: {
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    elevation: 3,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  swipeHint: {
    marginBottom: 12,
    alignItems: 'center',
  },
  swipeHintText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  swipeableContainer: {
    position: 'relative',
    marginBottom: 12,
    overflow: 'hidden',
    borderRadius: 16,
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 20,
    borderRadius: 16,
  },
  deleteIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  deleteText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  swipeableEntry: {
    width: '100%',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  logEntry: {
    borderRadius: 16,
    padding: 16,
    elevation: 1,
    borderLeftWidth: 4,
  },
  logContent: {
    flex: 1,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  logMoodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  logEmoji: {
    fontSize: 28,
  },
  logTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  logTimestamp: {
    fontSize: 12,
    fontWeight: '500',
  },
  divider: {
    marginVertical: 12,
    height: 1,
  },
  logNote: {
    fontSize: 14,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  tagChip: {
    marginRight: 4,
  },
  card: {
    borderRadius: 20,
    margin: 16,
    elevation: 3,
  },
  prompt: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 24,
  },
  input: {
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  saveButton: {
    marginTop: 16,
  },
  entryDate: {
    fontSize: 12,
    marginBottom: 8,
  },
  entryPrompt: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 12,
    lineHeight: 20,
  },
  gratitudeItem: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
    marginLeft: 8,
  },
  reflectionText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
})
