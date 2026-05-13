// NotificationsScreen - In-app notification list with read/unread styling
import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { useNotifications, useMarkAsRead } from '@/hooks/useNotifications';
import { formatDate } from '@/utils/format';
import type { Notification } from '@/types';

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const { data: notifications = [], isLoading, isError, error, refetch } = useNotifications();
  const { mutate: markAsRead } = useMarkAsRead();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      className="flex-row items-start gap-3 px-4 py-4 mx-3 mt-2 rounded-xl"
      style={{
        backgroundColor: item.isRead ? '#FFFFFF' : '#F0F4FF',
        ...Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
          },
          android: { elevation: 2 },
          web: { boxShadow: '0px 1px 8px rgba(0, 0, 0, 0.06)' },
        }),
      }}
      onPress={() => {
        if (!item.isRead) markAsRead(item.id);
      }}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`${item.isRead ? 'Read' : 'Unread'} notification: ${item.title}`}
      accessibilityState={{ selected: !item.isRead }}
    >
      {/* Icon */}
      <View
        className="w-11 h-11 rounded-xl items-center justify-center mt-0.5 shrink-0"
        style={{ backgroundColor: item.isRead ? '#F0F2F5' : '#F3E8FF' }}
      >
        <Ionicons
          name={
            item.type === 'order_update'
              ? 'receipt-outline'
              : item.type === 'promotion'
              ? 'pricetag-outline'
              : 'notifications-outline'
          }
          size={20}
          color={item.isRead ? '#8E8E93' : '#7C3AED'}
        />
      </View>

      {/* Content */}
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center justify-between gap-2">
          <Text
            style={{
              fontFamily: item.isRead ? 'NunitoSans_400Regular' : 'NunitoSans_700Bold',
              fontSize: 14,
              color: '#111322',
              flex: 1,
            }}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          {!item.isRead && (
            <View className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: '#7C3AED' }} />
          )}
        </View>
        <Text
          style={{ fontFamily: 'NunitoSans_400Regular', fontSize: 13, color: '#5F6C7B', lineHeight: 20 }}
          numberOfLines={2}
        >
          {item.body}
        </Text>
        <Text style={{ fontFamily: 'NunitoSans_400Regular', fontSize: 11, color: '#8E8E93', marginTop: 4 }}>
          {formatDate(item.createdAt, 'relative')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-[#F8F9FA]" style={{ paddingTop: insets.top }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View
        className="flex-row items-center px-4 py-4 bg-white gap-3"
        style={{
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04,
              shadowRadius: 4,
            },
            android: { elevation: 1 },
            web: { boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.04)' },
          }),
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-1"
          style={{ minWidth: 44, minHeight: 44, justifyContent: 'center' }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color="#111322" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Rubik_700Bold', fontSize: 26, color: '#111322', flex: 1, letterSpacing: -0.3 }}>
          Notifications
        </Text>
        {unreadCount > 0 && (
          <View className="px-3 py-1.5 rounded-full" style={{ backgroundColor: '#F3E8FF' }}>
            <Text style={{ fontFamily: 'NunitoSans_700Bold', fontSize: 12, color: '#7C3AED' }}>
              {unreadCount} new
            </Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      ) : isError ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{error?.message || 'Failed to load notifications'}</Text>
          <View style={{ marginTop: 8 }}>
            <Button title="Retry" onPress={() => refetch()} size="sm" />
          </View>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: insets.bottom + 16, paddingTop: 8 }}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#7C3AED" />
          }
          ListEmptyComponent={
            <EmptyState
              title="No notifications"
              subtitle="You're all caught up!"
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  errorTitle: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: 18,
    color: '#111322',
    textAlign: 'center',
  },
  errorMessage: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 14,
    color: '#5F6C7B',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    marginTop: 8,
    backgroundColor: '#7C3AED',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 9999,
  },
});