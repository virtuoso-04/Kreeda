import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

interface SimpleHeaderProps {
  title: string;
  subtitle?: string;
}

const SimpleHeader: React.FC<SimpleHeaderProps> = ({title, subtitle}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2196F3',
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: 'white',
    fontSize: 16,
    marginTop: 4,
    opacity: 0.9,
  },
});

export default SimpleHeader;