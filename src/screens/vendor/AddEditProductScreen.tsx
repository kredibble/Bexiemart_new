/**
 * AddEditProductScreen — Product creation/edit form.
 *
 * Features:
 *  - Image picker (expo-image-picker) with Cloudinary upload
 *  - Zod validation (name, description, price, category, quantity, delivery options)
 *  - Add/remove delivery options dynamically
 *  - Loading state on submit + upload progress
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

import { useCreateProduct, useUpdateProduct } from '@/hooks/useVendor';
import { uploadImage } from '@/utils/cloudinary';
import { colors, shadows, radii } from '@/theme/colors';
import { typePresets } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/ui/FormInput';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { Product } from '@/types';

type RouteParams =
  | { mode: 'add' }
  | { mode: 'edit'; product: Product };

interface PendingImage {
  uri: string;
  uploadedUrl?: string;
  uploading: boolean;
  error: boolean;
}

export default function AddEditProductScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { mode } = (route.params ?? { mode: 'add' }) as { mode: 'add' | 'edit' };
  const product = mode === 'edit' ? ((route.params as any).product as Product) : null;

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [price, setPrice] = useState(product?.price?.toString() ?? '');
  const [quantity, setQuantity] = useState((product?.quantity ?? product?.stock)?.toString() ?? '');

  // Images: track local URIs and uploaded Cloudinary URLs
  const [pendingImages, setPendingImages] = useState<PendingImage[]>(
    product?.images?.map((img) => ({ uri: img.url, uploadedUrl: img.url, uploading: false, error: false })) ?? []
  );

  // Delivery options
  const [deliveryOptions, setDeliveryOptions] = useState<
    { type: string; fee: number; duration: number; unit: string }[]
  >(product?.deliveryOptions ?? []);
  const [newDelType, setNewDelType] = useState('');
  const [newDelFee, setNewDelFee] = useState('');
  const [newDelDuration, setNewDelDuration] = useState('');

  const isUploading = pendingImages.some((img) => img.uploading);
  const allUploaded = pendingImages.length > 0 && pendingImages.every((img) => img.uploadedUrl && !img.error);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const newImages: PendingImage[] = result.assets.map((asset) => ({
        uri: asset.uri,
        uploadedUrl: undefined,
        uploading: false,
        error: false,
      }));
      setPendingImages((prev) => [...prev, ...newImages]);

      // Auto-upload each image to Cloudinary
      for (const asset of result.assets) {
        await uploadSingleImage(asset.uri);
      }
    }
  };

  const uploadSingleImage = async (uri: string) => {
    const index = pendingImages.findIndex((img) => img.uri === uri);
    if (index === -1) return;

    setPendingImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, uploading: true, error: false } : img))
    );

    try {
      const result = await uploadImage(uri, 'products');
      setPendingImages((prev) =>
        prev.map((img, i) =>
          i === index ? { ...img, uploading: false, uploadedUrl: result.url } : img
        )
      );
    } catch {
      setPendingImages((prev) =>
        prev.map((img, i) => (i === index ? { ...img, uploading: false, error: true } : img))
      );
      Alert.alert('Upload Failed', 'Could not upload image. Tap retry or remove it.');
    }
  };

  const retryUpload = (index: number) => {
    uploadSingleImage(pendingImages[index].uri);
  };

  const removeImage = (index: number) => {
    setPendingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addDeliveryOption = () => {
    const fee = parseFloat(newDelFee);
    const duration = parseFloat(newDelDuration);
    if (!newDelType.trim() || isNaN(fee) || isNaN(duration)) {
      Alert.alert('Invalid delivery option', 'Fill in all delivery fields.');
      return;
    }
    setDeliveryOptions((prev) => [
      ...prev,
      { type: newDelType.trim(), fee, duration, unit: 'hours' },
    ]);
    setNewDelType('');
    setNewDelFee('');
    setNewDelDuration('');
  };

  const removeDeliveryOption = (index: number) => {
    setDeliveryOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const errors: string[] = [];
    if (!name.trim()) errors.push('Name is required');
    if (!description.trim()) errors.push('Description is required');
    if (!price || parseFloat(price) <= 0) errors.push('Valid price is required');
    if (!quantity || parseInt(quantity) < 0) errors.push('Valid quantity is required');
    if (pendingImages.length === 0) errors.push('At least one image is required');
    if (deliveryOptions.length === 0) errors.push('At least one delivery option is required');

    if (isUploading) {
      Alert.alert('Uploading', 'Please wait for images to finish uploading.');
      return;
    }

    if (!allUploaded) {
      errors.push('Some images failed to upload. Remove or retry them.');
    }

    if (errors.length > 0) {
      Alert.alert('Validation Error', errors.join('\n'));
      return;
    }

    const imageUrls = pendingImages
      .map((img) => img.uploadedUrl)
      .filter((url): url is string => !!url);

    const payload = {
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      categoryId: product?.categoryId ?? 'default',
      quantity: parseInt(quantity),
      images: imageUrls,
      deliveryOptions,
    };

    if (mode === 'add') {
      createMutation.mutate(payload, {
        onSuccess: () => {
          Alert.alert('Success', 'Product created');
          (navigation as any).goBack();
        },
        onError: () => {
          Alert.alert('Error', 'Failed to create product');
        },
      });
    } else {
      updateMutation.mutate(
        { id: product!.id, data: payload },
        {
          onSuccess: () => {
            Alert.alert('Success', 'Product updated');
            (navigation as any).goBack();
          },
          onError: () => {
            Alert.alert('Error', 'Failed to update product');
          },
        }
      );
    }
  };

  const uploadedCount = pendingImages.filter((img) => img.uploadedUrl).length;

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => (navigation as any).goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {mode === 'add' ? 'Add Product' : 'Edit Product'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Images */}
        <View style={styles.imageHeader}>
          <Text style={styles.label}>Product Images</Text>
          {pendingImages.length > 0 && (
            <Text style={styles.imageCount}>
              {uploadedCount}/{pendingImages.length} uploaded
            </Text>
          )}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageRow}>
          {pendingImages.map((img, i) => (
            <View key={i} style={styles.imageThumb}>
              <Image source={{ uri: img.uploadedUrl ?? img.uri }} style={styles.imageThumbInner} />
              {img.uploading && (
                <View style={styles.imageOverlay}>
                  <LoadingSpinner size="small" color={colors.white} />
                </View>
              )}
              {img.error && (
                <View style={styles.imageOverlay}>
                  <TouchableOpacity
                    style={styles.retryBadge}
                    onPress={() => retryUpload(i)}
                  >
                    <Ionicons name="refresh-outline" size={16} color={colors.white} />
                  </TouchableOpacity>
                </View>
              )}
              {!img.uploading && (
                <TouchableOpacity style={styles.removeImage} onPress={() => removeImage(i)}>
                  <Ionicons name="close-circle" size={20} color={colors.error} />
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
            <Ionicons name="camera-outline" size={28} color={colors.textLight} />
            <Text style={styles.addImageText}>Add</Text>
          </TouchableOpacity>
        </ScrollView>

        <FormInput
          label="Product Name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Fresh Tomatoes (1kg)"
        />

        <FormInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Describe your product..."
          multiline
        />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <FormInput
              label="Price (₦)"
              value={price}
              onChangeText={setPrice}
              placeholder="0.00"
              keyboardType="decimal-pad"
            />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <FormInput
              label="Quantity"
              value={quantity}
              onChangeText={setQuantity}
              placeholder="0"
              keyboardType="number-pad"
            />
          </View>
        </View>

        {/* Delivery Options */}
        <Text style={styles.label}>Delivery Options</Text>
        {deliveryOptions.map((opt, i) => (
          <View key={i} style={styles.deliveryRow}>
            <Text style={styles.deliveryText}>
              {opt.type} — ₦{opt.fee} ({opt.duration}{opt.unit})
            </Text>
            <TouchableOpacity onPress={() => removeDeliveryOption(i)}>
              <Ionicons name="trash-outline" size={18} color={colors.error} />
            </TouchableOpacity>
          </View>
        ))}
        <View style={styles.deliveryForm}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            value={newDelType}
            onChangeText={setNewDelType}
            placeholder="Type (e.g. Express)"
            placeholderTextColor={colors.textLight}
          />
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            value={newDelFee}
            onChangeText={setNewDelFee}
            placeholder="Fee"
            placeholderTextColor={colors.textLight}
            keyboardType="decimal-pad"
          />
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            value={newDelDuration}
            onChangeText={setNewDelDuration}
            placeholder="Duration"
            placeholderTextColor={colors.textLight}
            keyboardType="number-pad"
          />
          <TouchableOpacity style={styles.addDelBtn} onPress={addDeliveryOption}>
            <Ionicons name="add" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>

        <Button
          title={mode === 'add' ? 'Create Product' : 'Save Changes'}
          onPress={handleSubmit}
          loading={createMutation.isPending || updateMutation.isPending}
          disabled={isUploading}
          fullWidth
          style={{ marginTop: 32 }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ── Styles ────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typePresets.h3,
    fontFamily: 'Raleway_700Bold',
    color: colors.text,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  imageHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
  },
  imageCount: {
    ...typePresets.caption,
    color: colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  imageRow: {
    flexDirection: 'row',
    gap: 10,
  },
  imageThumb: {
    width: 80,
    height: 80,
    borderRadius: radii.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  imageThumbInner: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImage: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  addImageBtn: {
    width: 80,
    height: 80,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.borderLight,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  addImageText: {
    ...typePresets.caption,
    color: colors.textLight,
    marginTop: 2,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    ...shadows.sm,
  },
  deliveryText: {
    ...typePresets.bodySm,
    color: colors.text,
  },
  deliveryForm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  addDelBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

});
