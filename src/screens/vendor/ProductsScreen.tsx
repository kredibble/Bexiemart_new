import { View, Text } from "react-native";
import { useVendorProducts } from "@/hooks/useVendor";
import ProductGrid from "@/components/product/ProductGrid";

export default function ProductsScreen() {
  const { data, isLoading } = useVendorProducts();

  if (isLoading) return <Text>Loading...</Text>;

  return (
    <View style={{ flex: 1 }}>
      <ProductGrid
        products={data || []}
        onPress={(p) => console.log(p)}
      />
    </View>
  );
}