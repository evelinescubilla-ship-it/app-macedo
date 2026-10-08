// lib/scan.ts
// Qué hacer cuando se lee un código: abrir el producto o ofrecer crearlo

import { Alert } from 'react-native';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { getProductoPorCodigo } from './store';

export function procesarCodigo(codigo: string) {
  const producto = getProductoPorCodigo(codigo);

  if (producto) {
    router.push({ pathname: '/add-product', params: { id: producto.id } } as unknown as Href);
    return;
  }

  Alert.alert('Código no registrado', `No hay ningún producto con el código ${codigo}. ¿Quieres crearlo?`, [
    { text: 'Cancelar', style: 'cancel' },
    {
      text: 'Crear producto',
      onPress: () =>
        router.push({ pathname: '/add-product', params: { codigo } } as unknown as Href),
    },
  ]);
}