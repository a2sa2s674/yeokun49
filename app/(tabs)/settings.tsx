import { View, Text, StyleSheet } from 'react-native';
import { AppColors } from '../../src/styles/tokens';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>설정</Text>
      <Text style={styles.subtitle}>앱 설정을 변경합니다</Text>
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
