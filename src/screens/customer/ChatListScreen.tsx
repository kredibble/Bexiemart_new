import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useConversations } from '@/hooks/useChat';
import { colors, shadows, radii } from '@/theme/colors';
import { typePresets } from '@/theme/typography';
import { formatRelativeTime } from '@/utils/format';
import type { HomeStackParamList } from '@/navigation/CustomerTabs';
import type { Conversation } from '@/types';

type Nav = NativeStackNavigationProp<HomeStackParamList>;

export default function ChatListScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { data: conversations, isLoading, refetch } = useConversations();

  const renderItem = useCallback(({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationRow}
      onPress={() => navigation.navigate('Chat', { conversationId: item.id, otherUserName: item.otherUser?.name ?? 'Chat' })}
      activeOpacity={0.7}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {(item.otherUser?.name ?? '?').charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.conversationInfo}>
        <View style={styles.topRow}>
          <Text style={styles.userName} numberOfLines={1}>{item.otherUser?.name ?? 'Unknown'}</Text>
          {item.lastMessage && (
            <Text style={styles.timeText}>{formatRelativeTime(item.lastMessage.createdAt)}</Text>
          )}
        </View>
        <Text style={[styles.lastMessage, !item.lastMessage?.isRead && styles.unread]} numberOfLines={1}>
          {item.lastMessage?.content ?? 'No messages yet'}
        </Text>
      </View>
      {item.unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadCount}>{item.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  ), [navigation]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : !conversations || conversations.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="chatbubbles-outline" size={64} color={colors.textLight} />
          <Text style={styles.emptyTitle}>No conversations yet</Text>
          <Text style={styles.emptySubtitle}>Start chatting with a vendor about an order</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={refetch} tintColor={colors.primary} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.white,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  headerTitle: { ...typePresets.h3, fontFamily: 'Rubik_700Bold', color: colors.text },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 32 },
  emptyTitle: { ...typePresets.h4, color: colors.text, marginTop: 8 },
  emptySubtitle: { ...typePresets.body, color: colors.textSecondary, textAlign: 'center' },
  listContent: { paddingVertical: 8 },
  conversationRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
    paddingHorizontal: 20, paddingVertical: 14, gap: 12,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: 'Rubik_700Bold', fontSize: 18, color: colors.primary },
  conversationInfo: { flex: 1, gap: 4 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  userName: { ...typePresets.body, fontFamily: 'NunitoSans_700Bold', color: colors.text },
  timeText: { ...typePresets.caption, color: colors.textLight },
  lastMessage: { ...typePresets.caption, color: colors.textSecondary },
  unread: { fontFamily: 'NunitoSans_700Bold', color: colors.text },
  unreadBadge: {
    backgroundColor: colors.primary, borderRadius: 10, minWidth: 20, height: 20,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
  },
  unreadCount: { fontSize: 11, color: colors.white, fontFamily: 'NunitoSans_700Bold' },
});
