import { yupResolver } from '@hookform/resolvers/yup';
import { Picker } from '@react-native-picker/picker';

import Checkbox from 'expo-checkbox';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Yup from 'yup';
import CharacterCard, { Character } from '../../components/CharacterCard';

type StatusValue = '' | 'alive' | 'dead' | 'unknown';

interface FormValues {
  name: string;
  email: string;
  species: string;
  status: StatusValue;
  minEpisodes: number;
  accept: boolean;
}


const SPECIES_OPTIONS = [
  { label: '(cualquiera)', value: '' },
  { label: 'Human', value: 'Human' },
  { label: 'Alien', value: 'Alien' },
  { label: 'Humanoid', value: 'Humanoid' },
  { label: 'Robot', value: 'Robot' },
  { label: 'Animal', value: 'Animal' },
  { label: 'Mythological Creature', value: 'Mythological Creature' },
  { label: 'Cronenberg', value: 'Cronenberg' },
  { label: 'Disease', value: 'Disease' },
  { label: 'Poopybutthole', value: 'Poopybutthole' },
] as const;

const schema: Yup.ObjectSchema<FormValues> = Yup.object({
  name: Yup.string().max(30, 'Máx 30 caracteres').default(''),
  email: Yup.string().email('Correo inválido').required('Requerido').default(''),

  species: Yup.mixed<string>()
    .oneOf(SPECIES_OPTIONS.map(o => o.value), 'Especie inválida')
    .default(''),
  status: Yup.mixed<StatusValue>()
    .oneOf(['', 'alive', 'dead', 'unknown'], 'Estado inválido')
    .default(''),
  minEpisodes: Yup.number()
    .typeError('Debe ser un número')
    .integer('Debe ser entero')
    .min(0, 'Mínimo 0')
    .max(1000, 'Demasiado alto')
    .default(0),
  accept: Yup.boolean().oneOf([true], 'Debes aceptar términos').default(false),
});

export default function IndexScreen() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Character[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<FormValues>({
      resolver: yupResolver(schema),
      defaultValues: schema.getDefault() as FormValues,
      mode: 'onTouched',
    });

  const onSubmit = async (values: FormValues) => {
    setErrorMsg('');
    setLoading(true);
    setResults([]);
    try {
      const params = new URLSearchParams();
      if (values.name) params.append('name', values.name);
      if (values.status) params.append('status', values.status);
      if (values.species) params.append('species', values.species);

      const url = `https://rickandmortyapi.com/api/character?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 404) {
          setResults([]);
          setLoading(false);
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }
      const data = (await res.json()) as { results?: Character[] };

      const minEp = Number(values.minEpisodes || 0);
      const filtered = (data.results ?? []).filter(
        (ch) => (ch.episode?.length ?? 0) >= minEp
      );

      setResults(filtered);
    } catch {
      setErrorMsg('Error al obtener datos. Verifica tu conexión o intenta con otros filtros.');
    } finally {
      setLoading(false);
    }
  };

  const onClear = () => {
    reset();
    setResults([]);
    setErrorMsg('');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0b1220' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <FlatList
          ListHeaderComponent={
            <View style={{ padding: 16 }}>
              <Text style={{ color: 'white', fontSize: 24, fontWeight: '700', marginBottom: 12 }}>
                Grupo 2 · Formularios (Expo)
              </Text>
              <Text style={{ color: '#cbd5e1', marginBottom: 16 }}>
                Valida datos y filtra personajes de Rick & Morty.
              </Text>

              <Text style={styles.label}>Correo (obligatorio)</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="tu@correo.com"
                    placeholderTextColor="#64748b"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                  />
                )}
              />
              {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

              <Text style={[styles.label, { marginTop: 12 }]}>Nombre (para filtrar)</Text>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="Rick, Morty..."
                    placeholderTextColor="#64748b"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    style={styles.input}
                  />
                )}
              />
              {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}

              <Text style={[styles.label, { marginTop: 12 }]}>Especie</Text>
              <View style={styles.pickerWrap}>
                <Controller
                  control={control}
                  name="species"
                  render={({ field: { onChange, value } }) => (
                    <Picker
                      selectedValue={value}
                      onValueChange={(v) => onChange(v)}
                      dropdownIconColor="#94a3b8"
                      style={{ color: 'white' }}
                    >
                      {SPECIES_OPTIONS.map(opt => (
                        <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
                      ))}
                    </Picker>
                  )}
                />
              </View>
              {errors.species && <Text style={styles.error}>{errors.species.message}</Text>}

              <Text style={[styles.label, { marginTop: 12 }]}>Estado</Text>
              <View style={styles.pickerWrap}>
                <Controller
                  control={control}
                  name="status"
                  render={({ field: { onChange, value } }) => (
                    <Picker
                      selectedValue={value}
                      onValueChange={(itemValue) => onChange(itemValue as StatusValue)}
                      dropdownIconColor="#94a3b8"
                      style={{ color: 'white' }}
                    >
                      <Picker.Item label="(cualquiera)" value="" />
                      <Picker.Item label="Alive" value="alive" />
                      <Picker.Item label="Dead" value="dead" />
                      <Picker.Item label="Unknown" value="unknown" />
                    </Picker>
                  )}
                />
              </View>
              {errors.status && <Text style={styles.error}>{errors.status.message}</Text>}

              <Text style={[styles.label, { marginTop: 12 }]}>Mínimo de episodios</Text>
              <Controller
                control={control}
                name="minEpisodes"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="0"
                    placeholderTextColor="#64748b"
                    onBlur={onBlur}
                    onChangeText={(txt) => onChange(Number(txt))}
                    value={String(value)}
                    keyboardType="numeric"
                    style={styles.input}
                  />
                )}
              />
              {errors.minEpisodes && <Text style={styles.error}>{errors.minEpisodes.message}</Text>}

              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                <Controller
                  control={control}
                  name="accept"
                  render={({ field: { onChange, value } }) => (
                    <Checkbox value={value} onValueChange={onChange} color={value ? '#22d3ee' : undefined} />
                  )}
                />
                <Text style={{ color: '#cbd5e1', marginLeft: 8 }}>Acepto los términos</Text>
              </View>
              {errors.accept && <Text style={styles.error}>{errors.accept.message}</Text>}

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
                <TouchableOpacity onPress={handleSubmit(onSubmit)} disabled={loading || isSubmitting} style={[styles.btn, { backgroundColor: '#22c55e' }]}>
                  <Text style={styles.btnText}>{loading ? 'Buscando...' : 'Buscar'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClear} style={[styles.btn, { backgroundColor: '#334155' }]}>
                  <Text style={styles.btnText}>Limpiar</Text>
                </TouchableOpacity>
              </View>

              {errorMsg ? <Text style={[styles.error, { marginTop: 12 }]}>{errorMsg}</Text> : null}

              <View style={{ height: 12 }} />
              <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>Resultados</Text>
              <View style={{ height: 8 }} />
            </View>
          }
          data={results}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <CharacterCard character={item} />}
          ListEmptyComponent={!loading ? <Text style={{ color: '#94a3b8', textAlign: 'center', marginTop: 16 }}>Sin resultados aún.</Text> : null}
          ListFooterComponent={loading ? <ActivityIndicator style={{ marginVertical: 16 }} /> : <View style={{ height: 24 }} />}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  label: { color: '#cbd5e1', marginBottom: 6 },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1f2937',
    color: 'white',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
  },
  pickerWrap: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 12,
  },
  error: { color: '#fca5a5', marginTop: 4 },
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  btnText: { color: 'white', fontWeight: '700' },
});
