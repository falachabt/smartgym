import { BorderRadius, Colors, Spacing, Typography } from '@/constants/Styles';
import { useExercices } from '@/hooks/useExercices';
import { useMachine } from '@/hooks/useMachine';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Dummy data for machines
const MACHINES_DATA: Record<string, any> = {
  'leg-press': {
    id: 'leg-press',
    name: 'Leg Press Machine',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
    videoThumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    tabs: ['Quadriceps', 'Hamstrings', 'Glutes'],
    howToUse: 'Sit on the machine with your back and head resting comfortably against the padded support. Place your feet on the footplate about hip-width apart, ensuring your heels are flat. Push the platform away using your heels and forefoot.',
    commonErrors: [
      'Not keeping back flat against the pad',
      'Locking knees at full extension',
      'Positioning feet too high or too low',
      'Using momentum instead of control'
    ],
    bodyPositioning: [
      'Back flat against pad',
      'Feet hip-width apart',
      'Knees aligned with toes',
      'Core engaged throughout'
    ],
    targetedMuscles: {
      primary: ['Quadriceps', 'Glutes', 'Hamstrings'],
      secondary: ['Calves', 'Core']
    },
    muscleImage: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
    recommendedWeights: {
      beginner: { weight: 40, reps: '12-15' },
      intermediate: { weight: 80, reps: '10-12' },
      advanced: { weight: 120, reps: '8-10' }
    }
  },
  'lat-pulldown': {
    id: 'lat-pulldown',
    name: 'Lat Pulldown Machine',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
    videoThumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    tabs: ['Back', 'Lats', 'Biceps'],
    howToUse: 'Sit at the machine and secure your thighs under the pads. Grab the bar with a wide grip, palms facing forward. Pull the bar down to your upper chest while keeping your torso upright. Slowly return to the starting position.',
    commonErrors: [
      'Pulling bar behind neck',
      'Using too much momentum',
      'Leaning too far back',
      'Not engaging shoulder blades'
    ],
    bodyPositioning: [
      'Chest up and proud',
      'Slight arch in lower back',
      'Feet flat on floor',
      'Shoulders down and back'
    ],
    targetedMuscles: {
      primary: ['Latissimus Dorsi', 'Rhomboids'],
      secondary: ['Biceps', 'Rear Deltoids', 'Trapezius']
    },
    muscleImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    recommendedWeights: {
      beginner: { weight: 30, reps: '12-15' },
      intermediate: { weight: 50, reps: '10-12' },
      advanced: { weight: 70, reps: '8-10' }
    }
  },
  'chest-press': {
    id: 'chest-press',
    name: 'Chest Press Machine',
    image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800',
    videoThumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    tabs: ['Chest', 'Pectorals', 'Triceps'],
    howToUse: 'Sit with your back flat against the pad. Grip the handles at chest height. Push the handles forward until your arms are extended, then slowly return to starting position.',
    commonErrors: [
      'Arching back excessively',
      'Flaring elbows too wide',
      'Not maintaining control on return',
      'Holding breath during movement'
    ],
    bodyPositioning: [
      'Back against pad',
      'Feet flat on floor',
      'Wrists straight',
      'Core engaged'
    ],
    targetedMuscles: {
      primary: ['Pectoralis Major', 'Anterior Deltoids'],
      secondary: ['Triceps', 'Serratus Anterior']
    },
    muscleImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    recommendedWeights: {
      beginner: { weight: 25, reps: '12-15' },
      intermediate: { weight: 45, reps: '10-12' },
      advanced: { weight: 65, reps: '8-10' }
    }
  }
};

export default function MachineDetailsScreen() {
  const params = useLocalSearchParams();
  const machineId = (params.qr_code as string) || 'leg-press';
  const machine = MACHINES_DATA[machineId] || MACHINES_DATA['leg-press'];

  const { machine: online, loading, error } = useMachine(machineId);
  const { exercices, loading: exercicesLoading, error: exercicesError } = useExercices(online?.machine_id ?? null);

  console.log('Fetched machine data:', online);
  console.log('Fetched exercices:', exercices);
  
  const [selectedTab, setSelectedTab] = useState(machine.tabs[0]);
  const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    howToUse: false,
    commonErrors: false,
    bodyPositioning: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{online?.nom_machine}</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Main Image */}
        <Image source={{ uri: online?.image_url || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800" }} style={styles.mainImage} />

        {/* Machine Name */}
        <View style={styles.titleSection}>
          <Text style={styles.machineName}>{machine.name}</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {machine.tabs.map((tab: string) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, selectedTab === tab && styles.tabActive]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Video Thumbnail */}
        <View style={styles.videoSection}>
          <Image source={{ uri: exercices?.[0]?.video_url || exercices?.[0]?.image_produit_url || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800" }} style={styles.videoThumbnail} />
          
        </View>

        {/* Collapsible Sections */}
        <View style={styles.sectionsContainer}>
          {/* How to Use */}
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => toggleSection('howToUse')}
          >
            <Text style={styles.sectionTitle}>How to Use</Text>
            <Text style={styles.sectionArrow}>{expandedSections.howToUse ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {expandedSections.howToUse && (
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>{machine.howToUse}</Text>
            </View>
          )}

          {/* Common Errors */}
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => toggleSection('commonErrors')}
          >
            <Text style={styles.sectionTitle}>Common Errors</Text>
            <Text style={styles.sectionArrow}>{expandedSections.commonErrors ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {expandedSections.commonErrors && (
            <View style={styles.sectionContent}>
              {machine.commonErrors.map((error: string, index: number) => (
                <Text key={index} style={styles.bulletPoint}>• {error}</Text>
              ))}
            </View>
          )}

          {/* Body Positioning */}
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => toggleSection('bodyPositioning')}
          >
            <Text style={styles.sectionTitle}>Body Positioning</Text>
            <Text style={styles.sectionArrow}>{expandedSections.bodyPositioning ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {expandedSections.bodyPositioning && (
            <View style={styles.sectionContent}>
              {machine.bodyPositioning.map((position: string, index: number) => (
                <Text key={index} style={styles.bulletPoint}>• {position}</Text>
              ))}
            </View>
          )}
        </View>

        {/* Targeted Muscles */}
        <View style={styles.musclesSection}>
          <Text style={styles.musclesSectionTitle}>Targeted Muscles</Text>
          <Image source={{ uri: machine.muscleImage }} style={styles.muscleImage} />
        </View>

        {/* Recommended Weights */}
        <View style={styles.weightsSection}>
          <Text style={styles.weightsSectionTitle}>Recommended Weights</Text>
          
          {/* Level Selector */}
          <View style={styles.levelSelector}>
            {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
              <TouchableOpacity
                key={level}
                style={[styles.levelButton, selectedLevel === level && styles.levelButtonActive]}
                onPress={() => setSelectedLevel(level)}
              >
                <Text style={[styles.levelButtonText, selectedLevel === level && styles.levelButtonTextActive]}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Weight Display */}
          <View style={styles.weightDisplay}>
            <View style={styles.weightBox}>
              <Text style={styles.weightLabel}>WEIGHT</Text>
              <Text style={styles.weightValue}>{machine.recommendedWeights[selectedLevel].weight}kg</Text>
            </View>
            <View style={styles.weightBox}>
              <Text style={styles.weightLabel}>Reps</Text>
              <Text style={styles.weightValue}>{machine.recommendedWeights[selectedLevel].reps}</Text>
            </View>
          </View>
        </View>

        {/* View Nutrition Plan Button */}
        <TouchableOpacity style={styles.nutritionButton}>
          <Text style={styles.nutritionButtonText}>View Nutrition Plan</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.dark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.primary.dark,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.md,
  },
  backButtonText: {
    fontSize: Typography.fontSize.xxl,
    color: Colors.text.primary,
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginLeft: Spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  mainImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.6,
    backgroundColor: Colors.background.card,
  },
  titleSection: {
    padding: Spacing.md,
  },
  machineName: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.input,
  },
  tabActive: {
    backgroundColor: Colors.primary.main,
  },
  tabText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
  },
  tabTextActive: {
    color: Colors.primary.dark,
    fontWeight: Typography.fontWeight.semibold,
  },
  videoSection: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  videoThumbnail: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.background.card,
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 60,
    height: 60,
    marginLeft: -30,
    marginTop: -30,
    backgroundColor: 'rgba(0, 255, 135, 0.9)',
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 24,
    color: Colors.primary.dark,
    marginLeft: 4,
  },
  sectionsContainer: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.input,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  sectionArrow: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  sectionContent: {
    paddingVertical: Spacing.md,
  },
  sectionText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  bulletPoint: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: 24,
    marginBottom: Spacing.xs,
  },
  musclesSection: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  musclesSectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  muscleImage: {
    width: '100%',
    height: 300,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.background.card,
  },
  weightsSection: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  weightsSectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  levelSelector: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  levelButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.input,
    alignItems: 'center',
  },
  levelButtonActive: {
    backgroundColor: Colors.primary.main,
  },
  levelButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
  },
  levelButtonTextActive: {
    color: Colors.primary.dark,
    fontWeight: Typography.fontWeight.semibold,
  },
  weightDisplay: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  weightBox: {
    flex: 1,
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  weightLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
  },
  weightValue: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  nutritionButton: {
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.primary.main,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  nutritionButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary.dark,
  },
});
