import { FlatList, Text, View } from "react-native";
import type { Product } from "@/types";
import { formatCurrency } from "@/utils/format";
import { colors } from "@/theme/colors";
import { fonts } from "@/theme/typography";
import { ProductCard } from "./ProductCard";

type ProductGridProps = {
  products: Product[];
  onPress?: (product: Product) => void;
  onToggleFavorite?: (productId: string) => void;
};

export default function ProductGrid({
  products,
  onPress,
  onToggleFavorite,
}: ProductGridProps) {
  if (!products.length) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
        }}
      >
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 15,
            color: colors.textSecondary,
            textAlign: "center",
            lineHeight: 22,
          }}
        >
          No products yet. Start adding products to see them here.
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
        <ProductCard
          product={item}
          onPress={() => onPress?.(item)}
          onToggleFavorite={onToggleFavorite}
        />
      )}
    />
  );
}
