import { FlatList, Text, TouchableOpacity, View } from "react-native";
import type { Product } from "@/types";
import { formatCurrency } from "@/utils/format";
import { colors } from "@/theme/colors";

type ProductGridProps = {
  products: Product[];
  onPress?: (product: Product) => void;
};

export default function ProductGrid({
  products,
  onPress,
}: ProductGridProps) {
  if (!products.length) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <Text
          style={{
            fontFamily: "NunitoSans_400Regular",
            fontSize: 15,
            color: colors.textSecondary,
            textAlign: "center",
          }}
        >
          No products yet. This grid is wired up and ready for real data.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={{ gap: 12 }}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => onPress?.(item)}
          style={{
            flex: 1,
            minHeight: 140,
            borderRadius: 16,
            padding: 16,
            backgroundColor: colors.white,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text
            style={{
              fontFamily: "NunitoSans_700Bold",
              fontSize: 16,
              color: colors.text,
              marginBottom: 6,
            }}
          >
            {item.name}
          </Text>
          <Text
            style={{
              fontFamily: "NunitoSans_400Regular",
              fontSize: 14,
              color: colors.textSecondary,
            }}
          >
            {formatCurrency(item.price)}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
}
