import { View, Text, StyleSheet } from 'react-native';
import { AppColors } from '../../src/styles/tokens';

export default function HelpersScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>조력자</Text>
      <Text style={styles.subtitle}>나의 조력자를 관리합니다</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.cream,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: AppColors.purpleMain,
  },
  subtitle: {
    fontSize: 14,
    color: AppColors.textMuted,
    marginTop: 8,
  },
});
