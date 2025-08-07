import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  BounceIn,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const AnimatedText = Animated.createAnimatedComponent(Text);
const AnimatedView = Animated.createAnimatedComponent(View);
const trophyColors = ['#f97316', '#10b981', '#3b82f6', '#f43f5e', '#a855f7'];

const userName = 'Sasha';
const totalStamps = 10;

const recentActivity = [
  {
    id: '1',
    type: 'stamp',
    title: 'Stamp added',
    cafe: 'Downtown Cafe',
    time: '2 hrs ago',
  },
  {
    id: '2',
    type: 'free',
    title: 'Free coffee claimed',
    cafe: 'Main Street Cafe',
    time: '1 day ago',
  },
  {
    id: '3',
    type: 'stamp',
    title: 'Stamp added',
    cafe: 'Park Avenue Cafe',
    time: '2 days ago',
  },
];

const nearbyCafes = [
  {
    id: '1',
    name: 'Downtown Cafe',
    distance: '0.2 miles',
    status: 'Open until 8pm',
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Main Street Cafe',
    distance: '0.5 miles',
    status: 'Open 24/7',
    rating: 4.6,
  },
  {
    id: '3',
    name: 'Park Avenue Cafe',
    distance: '0.8 miles',
    status: 'Closes at 6pm',
    rating: 4.9,
  },
];

export default function HomeScreen() {
  const [stampsCollected, setStampsCollected] = useState(0);
  const [showBigTrophy, setShowBigTrophy] = useState(false);
  const [colorIdx, setColorIdx] = useState(0);
  const [cardHeight, setCardHeight] = useState<number | null>(null);
  const [rewardCounter, setRewardCounter] = useState(0);

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming((stampsCollected / totalStamps) * 100);
  }, [stampsCollected]);
  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  const flyX = useSharedValue(0);
  const flyY = useSharedValue(0);
  const flyScale = useSharedValue(1);

  const rewardRef = useRef<View>(null);
  const stampRef = useRef<View>(null);

  const flyingStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: flyX.value },
      { translateY: flyY.value },
      { scale: flyScale.value },
    ],
  }));

  function flyTrophy() {
    if (!rewardRef.current || !stampRef.current) return;

    rewardRef.current.measureInWindow((rx, ry, rw) => {
      stampRef.current?.measureInWindow((sx, sy, sw) => {
        flyX.value = 0;
        flyY.value = 0;
        flyScale.value = 1;

        const deltaX = rx + rw / 2 - (sx + sw / 2);
        const deltaY = ry - sy - 125;

        flyX.value = withTiming(deltaX, { duration: 600 });
        flyY.value = withTiming(deltaY, { duration: 600 });
        flyScale.value = withTiming(0.5, { duration: 600 }, done => {
          if (done) runOnJS(onFlyComplete)();
        });
      });
    });
  }

  function onFlyComplete() {
    setShowBigTrophy(false);
    setStampsCollected(0);
    setRewardCounter(prev => prev + 1);
    setColorIdx(prev => (prev + 1) % trophyColors.length);
    setTimeout(() => {
      flyX.value = 0;
      flyY.value = 0;
      flyScale.value = 1;
    }, 0);
  }

  const handleStampPress = () => {
    const next = stampsCollected + 1;
    if (next === totalStamps) {
      setStampsCollected(next);
      setShowBigTrophy(true);
    } else {
      setStampsCollected(next);
    }
  };

  useEffect(() => {
    if (showBigTrophy) {
      setTimeout(flyTrophy, 400);
    }
  }, [showBigTrophy]);

  const renderStamp = (filled: boolean) =>
    filled ? (
      <View style={[styles.stampCircle, styles.stampFilled]}>
        <AnimatedView entering={BounceIn.duration(300)}>
          <FontAwesome5 name="coffee" size={20} color="#fff" />
        </AnimatedView>
      </View>
    ) : (
      <View style={[styles.stampCircle, styles.stampEmpty]} />
    );

  const renderActivityItem = ({ item }: any) => (
    <View style={styles.activityRow}>
      <View style={styles.activityIconWrapper}>
        {item.type === 'stamp' && (
          <FontAwesome5 name="coffee" size={20} color="#fff" />
        )}
        {item.type === 'free' && (
          <FontAwesome5 name="gift" size={20} color="#fff" />
        )}
      </View>
      <View style={styles.activityTextWrapper}>
        <Text style={styles.activityTitle}>{item.title}</Text>
        <Text style={styles.activitySubtitle}>{item.cafe}</Text>
      </View>
      <Text style={styles.activityTime}>{item.time}</Text>
    </View>
  );

  const renderCafeItem = ({ item }: any) => (
    <View style={styles.cafeRow}>
      <View style={styles.cafeIconWrapper}>
        <FontAwesome5 name="store" size={20} color="#fff" />
      </View>

      <View style={styles.cafeTextWrapper}>
        <Text style={styles.cafeName}>{item.name}</Text>
        <Text style={styles.cafeDistance}>{item.distance} away</Text>
        <View style={styles.cafeRatingRow}>
          <FontAwesome5 name="star" size={14} color="#fbbf24" />
          <Text style={styles.cafeRating}> {item.rating}</Text>
        </View>
      </View>

      <View style={styles.cafeRightWrapper}>
        <Text style={styles.cafeStatus}>{item.status}</Text>
        <TouchableOpacity style={styles.visitButton}>
          <Text style={styles.visitButtonText}>Visit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {userName}!</Text>
            <Text style={styles.subGreeting}>
              Welcome back to Cherry on Top
            </Text>
          </View>
          <MaterialCommunityIcons
            name="account-circle"
            size={48}
            color="#000"
          />
        </View>

        {/* Total Rewards card */}
        <View style={[styles.card, { paddingVertical: 20 }]}>
          <Text style={styles.cardLabel}>Total Rewards Earned</Text>
          <View style={styles.cardContent}>
            <AnimatedText style={styles.rewardNumber}>
              {rewardCounter}
            </AnimatedText>
            {/* wrap trophy so we can measure it */}
            <AnimatedView ref={rewardRef} collapsable={false}>
              <FontAwesome5
                name="trophy"
                size={32}
                color={trophyColors[colorIdx]}
              />
            </AnimatedView>
          </View>
        </View>

        {/* Stamp Card */}
        <Text style={styles.sectionTitle}>Your Stamp Card</Text>
        <Pressable onPress={handleStampPress}>
          <AnimatedView
            ref={stampRef}
            collapsable={false}
            style={[
              styles.card,
              { paddingVertical: 20 },
              showBigTrophy && cardHeight ? { height: cardHeight } : null,
            ]}
            onLayout={e => {
              if (!showBigTrophy) setCardHeight(e.nativeEvent.layout.height);
            }}
          >
            {showBigTrophy ? (
              <AnimatedView style={[styles.bigTrophyCenter, flyingStyle]}>
                <FontAwesome5
                  name="trophy"
                  size={64}
                  color={trophyColors[colorIdx]}
                />
              </AnimatedView>
            ) : (
              <>
                <Text style={styles.stampCardHeader}>
                  Collect 10 stamps for a free coffee!
                </Text>
                <Text style={styles.stampCardSub}>
                  Tap the card to add a stamp
                </Text>

                <View style={styles.stampGrid}>
                  <FlatList
                    data={Array.from({ length: totalStamps })}
                    renderItem={({ index }) =>
                      renderStamp(index < stampsCollected)
                    }
                    keyExtractor={(_, i) => i.toString()}
                    numColumns={5}
                    columnWrapperStyle={styles.stampRow}
                    scrollEnabled={false}
                  />
                </View>

                <View style={styles.progressBarBackground}>
                  <Animated.View
                    style={[styles.progressBarFill, progressStyle]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {stampsCollected} of {totalStamps} stamps collected
                </Text>
              </>
            )}
          </AnimatedView>
        </Pressable>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={[styles.card, { paddingVertical: 8 }]}>
          <FlatList
            data={recentActivity}
            keyExtractor={item => item.id}
            renderItem={renderActivityItem}
            ItemSeparatorComponent={() => (
              <View style={styles.activitySeparator} />
            )}
            scrollEnabled={false}
          />
        </View>

        {/* Nearby Cafes */}
        <Text style={styles.sectionTitle}>Nearby Cafes</Text>
        <View style={styles.card}>
          <FlatList
            data={nearbyCafes}
            keyExtractor={item => item.id}
            renderItem={renderCafeItem}
            ItemSeparatorComponent={() => (
              <View style={styles.activitySeparator} />
            )}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const circleSize = 48;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fb',
  },
  content: {
    padding: 16,
    paddingBottom: 58,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 14,
    color: '#6b7280',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  cardLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: '#111827',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
  },
  stampCardHeader: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  stampCardSub: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  stampGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stampRow: {
    flex: 1,
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  stampCircle: {
    width: circleSize,
    height: circleSize,
    borderRadius: circleSize / 2,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stampFilled: {
    backgroundColor: '#1f2937',
  },
  stampEmpty: {
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1f2937',
  },
  progressText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#374151',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  activityIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityTextWrapper: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  activityTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  activitySeparator: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  cafeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  cafeIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cafeTextWrapper: {
    flex: 1,
  },
  cafeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  cafeDistance: {
    fontSize: 14,
    color: '#6b7280',
  },
  cafeRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  cafeRating: {
    fontSize: 14,
    color: '#374151',
  },
  cafeRightWrapper: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  cafeStatus: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  visitButton: {
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
  },
  visitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  bigTrophyCenter: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
});
