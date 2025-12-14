import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HomePage: React.FC = () => {
  return (
    <View style={styles.pageContainer}>
      <Text style={styles.pageTitle}>首页</Text>
      <Text style={styles.pageSubtitle}>敬请期待...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#EAEBEF',
    marginBottom: 12,
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#8A919E',
  },
});

export default HomePage;
