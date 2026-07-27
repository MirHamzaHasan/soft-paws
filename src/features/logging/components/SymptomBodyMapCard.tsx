import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type SymptomHotspot = {
  id: string;
  x: number;
  y: number;
};

type SymptomBodyMapCardProps = {
  value: string;
  hotspots: SymptomHotspot[];
  onChange: (id: string) => void;
};

const styles = StyleSheet.create({
  card: {
    minHeight: 278,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#DDD8D2',
    backgroundColor: '#FFFCFA',
    overflow: 'hidden',
  },
  canvas: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  figure: {
    width: 220,
    height: 160,
    opacity: 0.16,
  },
  hotspot: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#DDD8D2',
    backgroundColor: '#FFFCFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -17,
    marginTop: -17,
  },
  hotspotInner: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#757B80',
  },
  hotspotSelected: {
    borderColor: '#F1CACA',
    backgroundColor: '#FFF0EE',
  },
  hotspotInnerSelected: {
    backgroundColor: '#A8342A',
  },
});

function DogOutline() {
  return (
    <Svg width="220" height="160" viewBox="0 0 220 160" fill="none">
      <Path
        d="M64 71C74 58 88 50 104 50H127C142 50 155 57 163 68L175 83C181 91 189 95 199 95V103C188 104 180 108 174 115L171 123C170 128 165 132 160 132H150V126C150 122 147 119 143 119H109C103 119 97 115 94 110L86 98L77 127C76 130 73 132 70 132H62L67 100L53 92C44 87 42 76 48 68L60 53L77 45L72 62L64 71Z"
        stroke="#6E747A"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <Path
        d="M82 52L90 36L102 44"
        stroke="#6E747A"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M160 132V119"
        stroke="#6E747A"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <Path
        d="M72 132L74 118"
        stroke="#6E747A"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <Path
        d="M105 119L103 132"
        stroke="#6E747A"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <Path
        d="M194 95L205 90"
        stroke="#6E747A"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function SymptomBodyMapCard({
  value,
  hotspots,
  onChange,
}: SymptomBodyMapCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.canvas}>
        <View style={styles.figure}>
          <DogOutline />
        </View>

        {hotspots.map((hotspot) => {
          const selected = hotspot.id === value;

          return (
            <Pressable
              key={hotspot.id}
              accessibilityRole="button"
              style={[
                styles.hotspot,
                { left: `${hotspot.x}%`, top: `${hotspot.y}%` },
                selected ? styles.hotspotSelected : null,
              ]}
              onPress={() => onChange(hotspot.id)}
            >
              <View
                style={[
                  styles.hotspotInner,
                  selected ? styles.hotspotInnerSelected : null,
                ]}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
