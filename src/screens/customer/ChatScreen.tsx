import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useMessages, useSendMessage, useMarkConversationRead } from '@/hooks/useChat';
import { colors, shadows, radii } from '@/theme/colors';
import { typePresets } from '@/theme/typography';
import { formatRelativeTime } from '@/utils/format';
import type { HomeStackParamList, HomeStackParamList as H } from '@/navigation/CustomerTabs';
import type { Message } from '@/types';

type Nav = NativeStackNavigationProp<HomeStackParamList>;
type Route = RouteProp<H, 'Chat'>;

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { conversationId } = route.params;
  const { data: messagesData, isLoading, refetch, isRefetching } = useMessages(conversationId);
  const sendMessage = useSendMessage(conversationId);
  const markRead = useMarkConversationRead();
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    markRead.mutate(conversationId);
  }, [conversationId]);

  const messages = messagesData?.data ?? [];

  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text) return;
    sendMessage.mutate(text);
    setInputText('');
  }, [inputText, sendMessage]);

  const renderMessage = useCallback(({ item }: { item: Message }) => {
    const isMine = item.senderId === 'me'; // Will be compared against current user
    return (
      <View style={[styles.messageBubble, isMine ? styles.myMessage : styles.theirMessage]}>
        <Text style={[styles.messageText, isMine ? styles.myMessageText : styles.theirMessageText]}>
          {item.content}
        </Text>
        <Text style={[styles.messageTime, isMine ? styles.myMessageTime : styles.theirMessageTime]}>
          {formatRelativeTime(item.createdAt)}
        </Text>
      </View>
    );
  }, []);

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{route.params.otherUserName}</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          refreshing={isRefetching}
          onRefresh={() => refetch()}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No messages yet. Say hello!</Text>
            </View>
          }
        />
      )}

      <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 8 }]}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor={colors.textLighter}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || sendMessage.isPending}
        >
          {sendMessage.isPending ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Ionicons name="send" size={20} color={colors.white} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: colors.white,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  headerTitle: { flex: 1, ...typePresets.h3, fontFamily: 'Rubik_700Bold', color: colors.text },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyText: { ...typePresets.body, color: colors.textSecondary },
  messagesList: { padding: 16, gap: 8, flexGrow: 1 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: radii.lg, gap: 4 },
  myMessage: {
    alignSelf: 'flex-end', backgroundColor: colors.primary,
    borderBottomRightRadius: radii.sm,
  },
  theirMessage: {
    alignSelf: 'flex-start', backgroundColor: colors.white,
    borderBottomLeftRadius: radii.sm,
    ...shadows.sm,
  },
  messageText: { ...typePresets.body, fontSize: 15 },
  myMessageText: { color: colors.white },
  theirMessageText: { color: colors.text },
  messageTime: { fontSize: 11, opacity: 0.7 },
  myMessageTime: { color: colors.white, textAlign: 'right' },
  theirMessageTime: { color: colors.textSecondary },
  inputContainer: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    paddingHorizontal: 16, paddingTop: 8, backgroundColor: colors.white,
    borderTopWidth: 1, borderTopColor: colors.borderLight,
  },
  input: {
    flex: 1, minHeight: 40, maxHeight: 100,
    backgroundColor: colors.surface, borderRadius: radii.full,
    paddingHorizontal: 16, paddingVertical: 10,
    ...typePresets.body, fontSize: 15, color: colors.text,
  },
  sendButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  sendButtonDisabled: { opacity: 0.5 },
});
