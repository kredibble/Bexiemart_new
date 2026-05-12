import { FlatList, Text, TouchableOpacity, View } from "react-native";
import type { Product } from "@/types";
import { formatCurrency } from "@/utils/format";

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
            fontFamily: "Nunito_400Regular",
            fontSize: 15,
            color: "#5F6C7B",
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
            backgroundColor: "#FFFFFF",
            borderWidth: 1,
            borderColor: "#E4E7EC",
          }}
        >
          <Text
            style={{
              fontFamily: "Nunito_700Bold",
              fontSize: 16,
              color: "#111322",
              marginBottom: 6,
            }}
          >
            {item.name}
          </Text>
          <Text
            style={{
              fontFamily: "Nunito_400Regular",
              fontSize: 14,
              color: "#5F6C7B",
            }}
          >
            {formatCurrency(item.price)}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
}
