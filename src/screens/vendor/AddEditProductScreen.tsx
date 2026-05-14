import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

import { useCreateProduct, useUpdateProduct } from '@/hooks/useVendor';
import { useCategories } from '@/hooks/useProducts';
import { uploadImage } from '@/utils/cloudinary';
import { colors, shadows, radii } from '@/theme/colors';
import { typePresets } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/ui/FormInput';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { Product } from '@/types';
import { ToastEmitter } from '@/utils/toastEmitter';
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

interface Variation {
  id: string;
  type: 'size' | 'color' | 'custom';
  name: string;
}

const VARIATION_TYPES = [
  { key: 'size' as const, label: 'Size', icon: 'resize-outline' as const },
  { key: 'color' as const, label: 'Color', icon: 'color-palette-outline' as const },
  { key: 'custom' as const, label: 'Custom', icon: 'add-outline' as const },
];

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

  const [pendingImages, setPendingImages] = useState<PendingImage[]>(
    product?.images?.map((img) => ({ uri: img.url, uploadedUrl: img.url, uploading: false, error: false })) ?? []
  );

  const { data: categories } = useCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(product?.categoryId ?? '');
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);

  const selectedCategory = categories?.find((c) => c.id === selectedCategoryId);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const clearError = (field: string) => setFieldErrors((prev) => ({ ...prev, [field]: '' }));

  const [inStock, setInStock] = useState(true);

  const [variations, setVariations] = useState<Variation[]>(
    product?.variations?.map((v, i) => ({
      id: `var_${i}`,
      type: v.type as Variation['type'],
      name: v.name,
    })) ?? []
  );
  const [variationType, setVariationType] = useState<Variation['type']>('size');
  const [variationName, setVariationName] = useState('');

  const [deliveryOptions, setDeliveryOptions] = useState<
    { type: string; fee: number; duration: number; unit: string }[]
  >(product?.deliveryOptions ?? []);
  const [newDelType, setNewDelType] = useState('');
  const [newDelFee, setNewDelFee] = useState('');
  const [newDelDuration, setNewDelDuration] = useState('');

  const isUploading = pendingImages.some((img) => img.uploading);
  const allUploaded = pendingImages.length > 0 && pendingImages.every((img) => img.uploadedUrl && !img.error);

  const pickImage = async () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
      ToastEmitter.error('Upload Failed', 'Could not upload image. Tap retry or remove it.');
    }
  };

  const retryUpload = (index: number) => {
    uploadSingleImage(pendingImages[index].uri);
  };

  const removeImage = (index: number) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPendingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addVariation = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const name = variationName.trim();
    if (!name) {
      ToastEmitter.warning('Required', 'Enter a name for this variation.');
      return;
    }
    if (variations.some((v) => v.type === variationType && v.name.toLowerCase() === name.toLowerCase())) {
      ToastEmitter.warning('Duplicate', 'This variation already exists.');
      return;
    }
    setVariations((prev) => [
      ...prev,
      { id: `var_${Date.now()}`, type: variationType, name },
    ]);
    setVariationName('');
  };

  const removeVariation = (id: string) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setVariations((prev) => prev.filter((v) => v.id !== id));
  };

  const addDeliveryOption = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const fee = parseFloat(newDelFee);
    const duration = parseFloat(newDelDuration);
    if (!newDelType.trim() || isNaN(fee) || isNaN(duration)) {
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      ToastEmitter.warning('Invalid delivery option', 'Fill in all delivery fields.');
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
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDeliveryOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setFieldErrors({});

    if (isUploading) {
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      ToastEmitter.info('Uploading', 'Please wait for images to finish uploading.');
      return;
    }

    const imageUrls = pendingImages
      .map((img) => img.uploadedUrl)
      .filter((url): url is string => !!url);

    if (!allUploaded) {
      ToastEmitter.error('Upload Error', 'Some images failed to upload. Remove or retry them.');
      return;
    }

    const finalQuantity = inStock ? (quantity ? parseInt(quantity, 10) : 0) : 0;

    const result = productSchema.safeParse({
      name: name.trim(),
      description: description.trim() || '',
      price: price ? parseFloat(price) : undefined,
      quantity: finalQuantity,
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

    const payload = {
      ...result.data,
      variations: variations.length > 0 ? variations.map(({ id, ...rest }) => rest) : undefined,
    };

    if (mode === 'add') {
      createMutation.mutate(payload, {
        onSuccess: () => {
          ToastEmitter.success('Product created');
          (navigation as any).goBack();
        },
        onError: () => {
          ToastEmitter.error('Failed to create product');
        },
      });
    } else {
      updateMutation.mutate(
        { id: product!.id, data: payload },
        {
          onSuccess: () => {
            ToastEmitter.success('Product updated');
            (navigation as any).goBack();
          },
          onError: () => {
            ToastEmitter.error('Failed to update product');
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

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            (navigation as any).goBack();
          }}
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

        {/* ── Images Section ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Photos</Text>
            {pendingImages.length > 0 && (
              <Text style={styles.imageCount}>
                {uploadedCount}/{pendingImages.length}
              </Text>
            )}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageRow}>
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
                    <TouchableOpacity style={styles.retryBadge} onPress={() => retryUpload(i)}>
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
              <Ionicons name="camera-outline" size={26} color={colors.textLight} />
              <Text style={styles.addImageText}>Add</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* ── Basic Info Section ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitleBlock}>Basic Info</Text>

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
                label="Compare at (optional)"
                value=""
                onChangeText={() => {}}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        </View>

        {/* ── Stock Status Section ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitleBlock}>Stock Status</Text>

          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, inStock && styles.toggleBtnActive]}
              onPress={() => { if (Platform.OS !== 'web') Haptics.selectionAsync(); setInStock(true); }}
              activeOpacity={0.7}
            >
              <View style={[styles.toggleDot, inStock && { backgroundColor: colors.success }]} />
              <Text style={[styles.toggleText, inStock && styles.toggleTextActive]}>In Stock</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, !inStock && styles.toggleBtnDanger]}
              onPress={() => { if (Platform.OS !== 'web') Haptics.selectionAsync(); setInStock(false); }}
              activeOpacity={0.7}
            >
              <View style={[styles.toggleDot, !inStock && { backgroundColor: colors.error }]} />
              <Text style={[styles.toggleText, !inStock && styles.toggleTextDanger]}>Out of Stock</Text>
            </TouchableOpacity>
          </View>

          {inStock && (
            <FormInput
              label="Quantity"
              value={quantity}
              onChangeText={(text) => { setQuantity(text); clearError('quantity'); }}
              placeholder="0"
              keyboardType="number-pad"
              error={fieldErrors.quantity}
            />
          )}
        </View>

        {/* ── Category Section ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitleBlock}>Category</Text>
          <TouchableOpacity
            style={[styles.categoryPicker, fieldErrors.categoryId && styles.categoryPickerError]}
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.selectionAsync();
              setCategoryPickerVisible(true);
            }}
            accessibilityRole="button"
            accessibilityHint="Selects a product category"
          >
            <Text style={[styles.categoryPickerText, !selectedCategory && { color: colors.textLight }]}>
              {selectedCategory?.name ?? 'Choose a category'}
            </Text>
            <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          {fieldErrors.categoryId && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <Ionicons name="alert-circle" size={14} color={colors.error} style={{ marginRight: 4 }} />
              <Text style={{ fontFamily: 'NunitoSans_400Regular', fontSize: 12, color: colors.error }}>
                {fieldErrors.categoryId}
              </Text>
            </View>
          )}
        </View>

        {/* ── Variations Section ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Variations</Text>
            <Text style={styles.optionalBadge}>Optional</Text>
          </View>

          {variations.length > 0 && (
            <View style={styles.chipRow}>
              {variations.map((v) => (
                <View key={v.id} style={styles.chip}>
                  <View style={[styles.chipTypeIndicator, { backgroundColor: v.type === 'size' ? '#7C3AED' : v.type === 'color' ? '#F59E0B' : '#10B981' }]} />
                  <Text style={styles.chipLabel}>{v.name}</Text>
                  <Text style={styles.chipType}>{v.type}</Text>
                  <TouchableOpacity onPress={() => removeVariation(v.id)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                    <Ionicons name="close" size={14} color={colors.textLight} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View style={styles.variationForm}>
            <View style={styles.variationTypes}>
              {VARIATION_TYPES.map((vt) => (
                <TouchableOpacity
                  key={vt.key}
                  style={[styles.variationTypeBtn, variationType === vt.key && styles.variationTypeBtnActive]}
                  onPress={() => { if (Platform.OS !== 'web') Haptics.selectionAsync(); setVariationType(vt.key); }}
                  activeOpacity={0.7}
                >
                  <Ionicons name={vt.icon} size={16} color={variationType === vt.key ? colors.white : colors.textSecondary} />
                  <Text style={[styles.variationTypeText, variationType === vt.key && styles.variationTypeTextActive]}>{vt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.variationInputRow}>
              <Input
                placeholder={variationType === 'size' ? 'e.g. Large' : variationType === 'color' ? 'e.g. Red' : 'e.g. Organic'}
                value={variationName}
                onChangeText={setVariationName}
                containerStyle={{ flex: 1, marginBottom: 0 }}
              />
              <TouchableOpacity style={styles.addVarBtn} onPress={addVariation} accessibilityLabel="Add variation" accessibilityRole="button">
                <Ionicons name="add" size={22} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Delivery Options Section ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Delivery Options</Text>
            <View style={styles.requiredBadge}>
              <View style={styles.requiredDot} />
              <Text style={styles.requiredBadgeText}>Required</Text>
            </View>
          </View>

          {deliveryOptions.length === 0 && (
            <View style={styles.deliveryEmpty}>
              <Ionicons name="bicycle-outline" size={28} color={colors.textLighter} />
              <Text style={styles.deliveryEmptyText}>No delivery options yet</Text>
              <Text style={styles.deliveryEmptyHint}>Add at least one option below</Text>
            </View>
          )}

          {deliveryOptions.length > 0 && (
            <View style={styles.deliveryList}>
              {deliveryOptions.map((opt, i) => (
                <View key={i} style={styles.deliveryRow}>
                  <View style={styles.deliveryAccent} />
                  <View style={styles.deliveryIconWrap}>
                    <Ionicons name="car-outline" size={18} color={colors.primary} />
                  </View>
                  <View style={styles.deliveryInfo}>
                    <Text style={styles.deliveryType}>{opt.type}</Text>
                    <Text style={styles.deliveryMeta}>
                      {opt.duration} {opt.unit}
                    </Text>
                  </View>
                  <Text style={styles.deliveryFee}>GH₵ {opt.fee.toFixed(2)}</Text>
                  <TouchableOpacity
                    onPress={() => removeDeliveryOption(i)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel="Remove delivery option"
                    accessibilityRole="button"
                    style={styles.deliveryRemoveBtn}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View style={styles.deliveryDivider} />

          <View style={styles.deliveryFormHeader}>
            <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
            <Text style={styles.deliveryFormLabel}>Add delivery option</Text>
          </View>

          {/* Row 1: Type (full width) */}
          <Input
            placeholder="Type (e.g. Express, Standard)"
            value={newDelType}
            onChangeText={setNewDelType}
            prefixIcon="car-outline"
            containerStyle={{ marginBottom: 10 }}
          />

          {/* Row 2: Fee + Duration */}
          <View style={styles.deliveryFormRow}>
            <Input
              placeholder="0.00"
              value={newDelFee}
              onChangeText={setNewDelFee}
              keyboardType="decimal-pad"
              prefixIcon="cash-outline"
              containerStyle={{ flex: 1, marginBottom: 0 }}
            />
            <Input
              placeholder="Hours"
              value={newDelDuration}
              onChangeText={setNewDelDuration}
              keyboardType="number-pad"
              prefixIcon="time-outline"
              containerStyle={{ flex: 1, marginBottom: 0 }}
            />
          </View>

          {/* Add button (full width) */}
          <TouchableOpacity
            style={styles.addDelBtn}
            onPress={addDeliveryOption}
            accessibilityLabel="Add delivery option"
            accessibilityRole="button"
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle-outline" size={18} color={colors.white} />
            <Text style={styles.addDelBtnText}>Add Option</Text>
          </TouchableOpacity>
        </View>

        <Button
          title={mode === 'add' ? 'Create Product' : 'Save Changes'}
          onPress={handleSubmit}
          loading={createMutation.isPending || updateMutation.isPending}
          disabled={isUploading}
          fullWidth
          style={{ marginTop: 8, marginBottom: 8 }}
        />
      </ScrollView>

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
                    if (Platform.OS !== 'web') Haptics.selectionAsync();
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FAFAFC',
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
    gap: 20,
  },

  /* Sections */
  section: {
    backgroundColor: colors.white,
    borderRadius: radii['2xl'],
    padding: 20,
    ...shadows.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Rubik_700Bold',
    fontSize: 16,
    color: colors.text,
  },
  sectionTitleBlock: {
    fontFamily: 'Rubik_700Bold',
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  optionalBadge: {
    fontFamily: 'NunitoSans_600SemiBold',
    fontSize: 11,
    color: colors.textLight,
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  /* Images */
  imageCount: {
    fontFamily: 'NunitoSans_600SemiBold',
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  imageRow: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 4,
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
    fontFamily: 'NunitoSans_600SemiBold',
    fontSize: 11,
    color: colors.textLight,
    marginTop: 2,
  },

  /* Stock Toggle */
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.white,
  },
  toggleBtnActive: {
    borderColor: colors.success,
    backgroundColor: '#F0FDF4',
  },
  toggleBtnDanger: {
    borderColor: colors.error,
    backgroundColor: '#FEF2F2',
  },
  toggleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textLight,
  },
  toggleText: {
    fontFamily: 'NunitoSans_600SemiBold',
    fontSize: 13,
    color: colors.textSecondary,
  },
  toggleTextActive: {
    color: colors.successDark,
    fontFamily: 'NunitoSans_700Bold',
  },
  toggleTextDanger: {
    color: colors.errorDark,
    fontFamily: 'NunitoSans_700Bold',
  },

  /* Category Picker */
  categoryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  categoryPickerError: {
    borderColor: colors.error,
    backgroundColor: '#FEF2F2',
  },
  categoryPickerText: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 15,
    color: colors.text,
    flex: 1,
  },

  /* Variations */
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: radii.full,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 10,
  },
  chipTypeIndicator: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipLabel: {
    fontFamily: 'NunitoSans_600SemiBold',
    fontSize: 13,
    color: colors.text,
  },
  chipType: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 11,
    color: colors.textLight,
  },
  variationForm: {
    gap: 12,
  },
  variationTypes: {
    flexDirection: 'row',
    gap: 8,
  },
  variationTypeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.white,
  },
  variationTypeBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  variationTypeText: {
    fontFamily: 'NunitoSans_600SemiBold',
    fontSize: 12,
    color: colors.textSecondary,
  },
  variationTypeTextActive: {
    color: colors.white,
  },
  variationInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addVarBtn: {
    width: 54,
    height: 54,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Required Badge */
  requiredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  requiredDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.error,
  },
  requiredBadgeText: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: 11,
    color: colors.error,
  },

  /* Delivery Options */
  deliveryEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderStyle: 'dashed',
    marginBottom: 4,
  },
  deliveryEmptyText: {
    fontFamily: 'NunitoSans_600SemiBold',
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  deliveryEmptyHint: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 12,
    color: colors.textLighter,
  },
  deliveryList: {
    gap: 10,
    marginBottom: 4,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingVertical: 14,
    paddingRight: 12,
    gap: 12,
    overflow: 'hidden',
  },
  deliveryAccent: {
    width: 4,
    height: '100%',
    backgroundColor: colors.primary,
    borderTopLeftRadius: radii.lg,
    borderBottomLeftRadius: radii.lg,
  },
  deliveryIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveryInfo: {
    flex: 1,
    gap: 2,
  },
  deliveryType: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: 14,
    color: colors.text,
  },
  deliveryMeta: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 12,
    color: colors.textSecondary,
  },
  deliveryFee: {
    fontFamily: 'Rubik_700Bold',
    fontSize: 15,
    color: colors.primary,
  },
  deliveryRemoveBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveryDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 16,
  },
  deliveryFormHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  deliveryFormLabel: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: 14,
    color: colors.text,
  },
  deliveryFormRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  addDelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    height: 54,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
  },
  addDelBtnText: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: 14,
    color: colors.white,
  },

  /* Category Modal */
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
    fontFamily: 'Rubik_700Bold',
    fontSize: 18,
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
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 15,
    color: colors.text,
  },
  categoryOptionTextSelected: {
    fontFamily: 'NunitoSans_700Bold',
    color: colors.primary,
  },
});
