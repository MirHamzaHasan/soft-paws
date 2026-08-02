import { StyleSheet, View } from "react-native";

import { HomeShell } from "../../home/components/HomeShell";
import { SkeletonBlock } from "../components/SkeletonBlock";

const styles = StyleSheet.create({
  stack: {
    gap: 16,
  },
  hero: {
    gap: 14,
  },
  heroCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E4E0DC",
    backgroundColor: "#FFFCFA",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  rowHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  tileGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tile: {
    flexBasis: "47%",
    flexGrow: 1,
    minHeight: 120,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E4E0DC",
    backgroundColor: "#FFFCFA",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  chartCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E4E0DC",
    backgroundColor: "#FFFCFA",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  chartBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 160,
    marginTop: 8,
  },
});

export default function LoadingSkeletonScreen() {
  const skeletonTiles = ["overview", "routine", "symptoms", "adherence"];
  const chartBars = [
    { key: "mon", height: 72 },
    { key: "tue", height: 104 },
    { key: "wed", height: 54 },
    { key: "thu", height: 132 },
    { key: "fri", height: 152 },
    { key: "sat", height: 112 },
    { key: "sun", height: 82 },
    { key: "extra", height: 36 },
  ];

  return (
    <HomeShell
      activeTab="insights"
      headerVariant="compact"
      headerAvatarEmoji="🧑"
      headerAvatarBackgroundColor="#E4E8F2"
    >
      <View style={styles.stack}>
        <View style={styles.hero}>
          <SkeletonBlock width="78%" height={44} borderRadius={14} />
          <SkeletonBlock width="58%" height={26} borderRadius={12} />
        </View>

        <View style={styles.heroCard}>
          <View style={styles.rowHeader}>
            <SkeletonBlock width={34} height={34} borderRadius={17} />
            <SkeletonBlock width="42%" height={22} borderRadius={10} />
          </View>
          <SkeletonBlock width="96%" height={16} borderRadius={8} />
          <SkeletonBlock width="91%" height={16} borderRadius={8} />
          <SkeletonBlock width="82%" height={16} borderRadius={8} />
          <SkeletonBlock width="58%" height={16} borderRadius={8} />
        </View>

        <View style={styles.tileGrid}>
          {skeletonTiles.map((key) => (
            <View key={key} style={styles.tile}>
              <SkeletonBlock width={46} height={46} borderRadius={23} />
              <SkeletonBlock width="62%" height={30} borderRadius={10} />
              <SkeletonBlock width="42%" height={18} borderRadius={8} />
            </View>
          ))}
        </View>

        <View style={styles.chartCard}>
          <SkeletonBlock width="70%" height={28} borderRadius={10} />
          <SkeletonBlock width="42%" height={18} borderRadius={8} />

          <View style={styles.chartBars}>
            {chartBars.map((bar) => (
              <SkeletonBlock
                key={bar.key}
                width={30}
                height={bar.height}
                borderRadius={4}
              />
            ))}
          </View>
        </View>
      </View>
    </HomeShell>
  );
}
