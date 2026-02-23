import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing } from '../../src/styles/tokens';

export default function ChatScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>조력자 채팅</Text>
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
