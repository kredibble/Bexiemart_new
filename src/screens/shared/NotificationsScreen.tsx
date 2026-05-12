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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { EmptyState } from '@/components/ui/EmptyState';
import { useNotifications, useMarkAsRead } from '@/hooks/useNotifications';
import { formatDate } from '@/utils/format';
import type { Notification } from '@/types';

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const { data: notifications = [], isLoading, refetch } = useNotifications();
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
        className="w-11 h-11 rounded-xl items-center justify-center mt-0.5 flex-shrink-0"
        style={{ backgroundColor: item.isRead ? '#F0F2F5' : '#EEF2FF' }}
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
          color={item.isRead ? '#8E8E93' : '#004CFF'}
        />
      </View>

      {/* Content */}
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center justify-between gap-2">
          <Text
            style={{
              fontFamily: item.isRead ? 'Nunito_400Regular' : 'Nunito_700Bold',
              fontSize: 14,
              color: '#111322',
              flex: 1,
            }}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          {!item.isRead && (
            <View className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#004CFF' }} />
          )}
        </View>
        <Text
          style={{ fontFamily: 'Nunito_400Regular', fontSize: 13, color: '#5F6C7B', lineHeight: 20 }}
          numberOfLines={2}
        >
          {item.body}
        </Text>
        <Text style={{ fontFamily: 'Nunito_400Regular', fontSize: 11, color: '#8E8E93', marginTop: 4 }}>
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
        <Text style={{ fontFamily: 'Raleway_700Bold', fontSize: 26, color: '#111322', flex: 1, letterSpacing: -0.3 }}>
          Notifications
        </Text>
        {unreadCount > 0 && (
          <View className="px-3 py-1.5 rounded-full" style={{ backgroundColor: '#EEF2FF' }}>
            <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 12, color: '#004CFF' }}>
              {unreadCount} new
            </Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#004CFF" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: insets.bottom + 16, paddingTop: 8 }}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#004CFF" />
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