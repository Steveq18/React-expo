import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export interface Character {
  id: number;
  name: string;
  status: string;
  species: string;
  image: string;
  episode: string[];
}

interface Props {
  character: Character;
}

export default function CharacterCard({ character }: Props) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: character.image }} style={styles.img} />
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{character.name}</Text>
        <Text style={styles.meta}>Estado: {character.status}</Text>
        <Text style={styles.meta}>Especie: {character.species}</Text>
        <Text style={styles.meta}>Episodios: {character.episode?.length ?? 0}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
    gap: 12,
  },
  img: { width: 72, height: 72, borderRadius: 12 },
  title: { color: 'white', fontSize: 16, fontWeight: '700' },
  meta: { color: '#94a3b8', marginTop: 2 },
});
