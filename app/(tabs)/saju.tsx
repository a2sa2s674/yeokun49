import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing } from '../../src/styles/tokens';

export default function SajuScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>사주 정보</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xxl,
    color: Colors.text,
    fontWeight: 'bold',
  },
});
