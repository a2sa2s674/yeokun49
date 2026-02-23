import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing } from '../../src/styles/tokens';

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>대시보드</Text>
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
