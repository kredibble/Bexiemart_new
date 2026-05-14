import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { colors, radii } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import type { StoryGroup } from '@/types';

interface StoryAvatarProps {
  group: StoryGroup;
  onPress: (group: StoryGroup) => void;
}

export default function StoryAvatar({ group, onPress }: StoryAvatarProps) {
  const hasUnviewed = !group.allViewed;

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(group)} activeOpacity={0.7}>
      <View style={[styles.ring, hasUnviewed && styles.unviewedRing]}>
        <View style={styles.avatarBg}>
          {group.user.image ? (
            <Image source={{ uri: group.user.image }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{group.user.name.charAt(0).toUpperCase()}</Text>
          )}
        </View>
      </View>
      <Text style={styles.name} numberOfLines={1}>{group.user.name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 4, width: 68 },
  ring: {
    width: 62, height: 62, borderRadius: 31,
    backgroundColor: colors.borderLight, padding: 3,
  },
  unviewedRing: { backgroundColor: colors.primary },
  avatarBg: {
    flex: 1, borderRadius: 28, backgroundColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { fontFamily: fonts.heading, fontSize: 20, color: colors.primary },
  name: { fontFamily: fonts.bodyMedium, fontSize: 11, color: colors.textSecondary, width: 68, textAlign: 'center' },
});
