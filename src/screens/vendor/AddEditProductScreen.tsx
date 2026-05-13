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
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

import { useCreateProduct, useUpdateProduct } from '@/hooks/useVendor';
import { useCategories } from '@/hooks/useProducts';
import { uploadImage } from '@/utils/cloudinary';
import { colors, shadows, radii } from '@/theme/colors';
import { typePresets } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/ui/FormInput';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { Product } from '@/types';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().default(''),
  price: z.number().positive('Price must be greater than 0'),
  quantity: z.number().int().nonnegative('Quantity must be 0 or more'),
  categoryId: z.string().min(1, 'Category is required'),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  deliveryOptions: z
    .array(z.object({ type: z.string(), fee: z.number(), duration: z.number(), unit: z.string() }))
    .min(1, 'At least one delivery option is required'),
});

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

  // Category
  const { data: categories } = useCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(product?.categoryId ?? '');
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);

  const selectedCategory = categories?.find((c) => c.id === selectedCategoryId);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const clearError = (field: string) => setFieldErrors((prev) => ({ ...prev, [field]: '' }));

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
    setFieldErrors({});

    if (isUploading) {
      Alert.alert('Uploading', 'Please wait for images to finish uploading.');
      return;
    }

    const imageUrls = pendingImages
      .map((img) => img.uploadedUrl)
      .filter((url): url is string => !!url);

    if (!allUploaded) {
      Alert.alert('Upload Error', 'Some images failed to upload. Remove or retry them.');
      return;
    }

    const result = productSchema.safeParse({
      name: name.trim(),
      description: description.trim() || '',
      price: price ? parseFloat(price) : undefined,
      quantity: quantity ? parseInt(quantity, 10) : undefined,
      categoryId: selectedCategoryId || undefined,
      images: imageUrls,
      deliveryOptions,
    });

    if (!result.success) {
      const flatErrors = result.error.flatten().fieldErrors;
      const errorMap: Record<string, string> = {};
      for (const [key, msgs] of Object.entries(flatErrors)) {
        if (msgs && msgs.length > 0) {
          errorMap[key] = msgs[0];
        }
      }
      setFieldErrors(errorMap);
      return;
    }

    const payload = result.data;

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
          accessibilityLabel="Go back"
          accessibilityRole="button"
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
                <TouchableOpacity style={styles.removeImage} onPress={() => removeImage(i)} accessibilityLabel="Remove image" accessibilityRole="button">
                  <Ionicons name="close-circle" size={20} color={colors.error} />
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity style={styles.addImageBtn} onPress={pickImage} accessibilityLabel="Add product image" accessibilityHint="Opens photo gallery" accessibilityRole="button">
            <Ionicons name="camera-outline" size={28} color={colors.textLight} />
            <Text style={styles.addImageText}>Add</Text>
          </TouchableOpacity>
        </ScrollView>

        <FormInput
          label="Product Name"
          value={name}
          onChangeText={(text) => { setName(text); clearError('name'); }}
          placeholder="e.g. Fresh Tomatoes (1kg)"
          error={fieldErrors.name}
        />

        <FormInput
          label="Description"
          value={description}
          onChangeText={(text) => { setDescription(text); clearError('description'); }}
          placeholder="Describe your product..."
          multiline
          error={fieldErrors.description}
        />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <FormInput
              label="Price (GH₵)"
              value={price}
              onChangeText={(text) => { setPrice(text); clearError('price'); }}
              placeholder="0.00"
              keyboardType="decimal-pad"
              error={fieldErrors.price}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <FormInput
              label="Quantity"
              value={quantity}
              onChangeText={(text) => { setQuantity(text); clearError('quantity'); }}
              placeholder="0"
              keyboardType="number-pad"
              error={fieldErrors.quantity}
            />
          </View>
        </View>

        {/* Category Picker */}
        <Text style={styles.label}>Category</Text>
        <TouchableOpacity
          style={[styles.categoryPicker, fieldErrors.categoryId && styles.categoryPickerError]}
          onPress={() => setCategoryPickerVisible(true)}
          accessibilityRole="button"
          accessibilityHint="Selects a product category"
        >
          <Text style={[styles.categoryPickerText, !selectedCategory && { color: colors.textLight }]}>
            {selectedCategory?.name ?? 'Select Category'}
          </Text>
          <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
        {fieldErrors.categoryId && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 12 }}>
            <Ionicons name="alert-circle" size={14} color={colors.error} style={{ marginRight: 4 }} />
            <Text style={{ fontFamily: 'NunitoSans_400Regular', fontSize: 12, color: colors.error }}>
              {fieldErrors.categoryId}
            </Text>
          </View>
        )}

        {/* Category Picker Modal */}
        <Modal visible={categoryPickerVisible} transparent animationType="fade" statusBarTranslucent>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setCategoryPickerVisible(false)}
          >
            <View style={styles.categoryModalContent}>
              <Text style={styles.categoryModalTitle}>Select Category</Text>
              <ScrollView style={{ maxHeight: 300 }}>
                {categories?.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryOption,
                      selectedCategoryId === cat.id && styles.categoryOptionSelected,
                    ]}
                    onPress={() => {
                      setSelectedCategoryId(cat.id);
                      setCategoryPickerVisible(false);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={cat.name}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        selectedCategoryId === cat.id && styles.categoryOptionTextSelected,
                      ]}
                    >
                      {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                    </Text>
                    {selectedCategoryId === cat.id && (
                      <Ionicons name="checkmark" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Delivery Options */}
        <Text style={styles.label}>Delivery Options</Text>
        {deliveryOptions.map((opt, i) => (
          <View key={i} style={styles.deliveryRow}>
            <Text style={styles.deliveryText}>
              {opt.type} — GH₵ {opt.fee} ({opt.duration}{opt.unit})
            </Text>
            <TouchableOpacity onPress={() => removeDeliveryOption(i)} accessibilityLabel="Remove delivery option" accessibilityRole="button">
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
          <TouchableOpacity style={styles.addDelBtn} onPress={addDeliveryOption} accessibilityLabel="Add delivery option" accessibilityRole="button">
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
    fontFamily: 'Rubik_700Bold',
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
  label: {
    ...typePresets.bodySm,
    fontFamily: 'NunitoSans_600SemiBold',
    color: colors.text,
    marginBottom: 6,
  },
  input: {
    ...typePresets.bodySm,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.text,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
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

  // Category Picker
  categoryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
  },
  categoryPickerError: {
    borderColor: colors.error,
    backgroundColor: '#FEF2F2',
    marginBottom: 0,
  },
  categoryPickerText: {
    ...typePresets.bodySm,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.text,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  categoryModalContent: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  categoryModalTitle: {
    ...typePresets.h4,
    fontFamily: 'Rubik_700Bold',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: radii.lg,
    marginBottom: 4,
  },
  categoryOptionSelected: {
    backgroundColor: colors.primarySoft,
  },
  categoryOptionText: {
    ...typePresets.body,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.text,
  },
  categoryOptionTextSelected: {
    fontFamily: 'NunitoSans_700Bold',
    color: colors.primary,
  },

});
