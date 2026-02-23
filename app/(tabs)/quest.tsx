import { View, Text, StyleSheet } from 'react-native';
import { AppColors } from '../../src/styles/tokens';

export default function QuestScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>퀘스트</Text>
      <Text style={styles.subtitle}>일일 퀘스트가 여기에 표시됩니다</Text>
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
