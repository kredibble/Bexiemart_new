// NotificationsScreen - In-app notification list with premium UX
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from 'react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';

import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { useNotifications, useMarkAsRead } from '@/hooks/useNotifications';
import { formatDate } from '@/utils/format';
import type { Notification } from '@/types';
import { colors, radii } from '@/theme/colors';

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const { data: notifications = [], isLoading, isError, error, refetch } = useNotifications();
  const { mutate: markAsRead } = useMarkAsRead();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = (id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    markAsRead(id);
  };

  const renderNotification = ({ item, index }: { item: Notification; index: number }) => {
    const isUnread = !item.isRead;
    
    return (
      <Animated.View
        entering={FadeInDown.delay(index * 50).springify().damping(14)}
        layout={Layout.springify()}
      >
        <TouchableOpacity
          style={[
            styles.notificationCard,
            isUnread && styles.notificationCardUnread,
          ]}
          onPress={() => {
            if (isUnread) handleMarkAsRead(item.id);
          }}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`${isUnread ? 'Unread' : 'Read'} notification: ${item.title}`}
          accessibilityState={{ selected: isUnread }}
        >
          {/* Unread Accent Line */}
          {isUnread && <View style={styles.unreadAccentLine} />}

          {/* Icon */}
          <View
            style={[
              styles.iconWrapper,
              { backgroundColor: isUnread ? colors.primaryLight : colors.surfaceDark },
            ]}
          >
            <Ionicons
              name={
                item.type === 'order_update'
                  ? 'receipt-outline'
                  : item.type === 'promotion'
                  ? 'sparkles-outline'
                  : 'notifications-outline'
              }
              size={22}
              color={isUnread ? colors.primary : colors.textSecondary}
            />
          </View>

          {/* Content */}
          <View style={styles.contentWrapper}>
            <View style={styles.headerRow}>
              <Text
                style={[
                  styles.titleText,
                  isUnread && styles.titleTextUnread,
                ]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              {isUnread && <View style={styles.unreadDot} />}
            </View>
            <Text
              style={[
                styles.bodyText,
                isUnread && styles.bodyTextUnread,
              ]}
              numberOfLines={2}
            >
              {item.body}
            </Text>
            <Text style={styles.timeText}>
              {formatDate(item.createdAt, 'relative')}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerRight}>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount} New</Text>
            </View>
          )}
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.centerContainer}>
          <View style={styles.errorIconContainer}>
            <Ionicons name="alert-circle" size={48} color={colors.error} />
          </View>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{error?.message || 'Failed to load notifications'}</Text>
          <Button title="Try Again" onPress={() => refetch()} size="sm" variant="outline" style={{ marginTop: 16 }} />
        </View>
      ) : (
        <Animated.FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <EmptyState
              title="No notifications yet"
              subtitle="When you get updates, they'll show up here."
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FAFAFC', // Sleek off-white bg
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
    }),
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 22,
    backgroundColor: colors.surface,
  },
  headerTitle: {
    fontFamily: 'Rubik_700Bold',
    fontSize: 24,
    color: colors.text,
    flex: 1,
    letterSpacing: -0.5,
  },
  headerRight: {
    minWidth: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    fontFamily: 'NunitoSans_800ExtraBold',
    fontSize: 12,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContent: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 12,
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 12,
      },
      android: { elevation: 1 },
      web: { boxShadow: '0 4px 12px rgba(0,0,0,0.03)' },
    }),
  },
  notificationCardUnread: {
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: { shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 3 },
      web: { boxShadow: '0 6px 16px rgba(0,0,0,0.08)' },
    }),
  },
  unreadAccentLine: {
    position: 'absolute',
    left: 0,
    top: 16,
    bottom: 16,
    width: 4,
    backgroundColor: colors.primary,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  titleText: {
    fontFamily: 'NunitoSans_600SemiBold',
    fontSize: 15,
    color: colors.textSecondary,
    flex: 1,
    marginRight: 8,
  },
  titleTextUnread: {
    fontFamily: 'NunitoSans_800ExtraBold',
    color: colors.text,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  bodyText: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  bodyTextUnread: {
    color: colors.text,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  timeText: {
    fontFamily: 'NunitoSans_600SemiBold',
    fontSize: 12,
    color: colors.textLight,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.errorSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  errorTitle: {
    fontFamily: 'Rubik_700Bold',
    fontSize: 20,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorMessage: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});