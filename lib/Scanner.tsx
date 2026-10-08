// lib/Scanner.tsx
// Ventana con la cámara para escanear códigos de barras / QR

import { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { palette } from './theme';

interface ScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScanned: (codigo: string) => void;
}

export function ScannerModal({ visible, onClose, onScanned }: ScannerModalProps) {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [yaEscaneo, setYaEscaneo] = useState(false);
  const [manual, setManual] = useState('');

  useEffect(() => {
    if (visible) {
      setYaEscaneo(false);
      setManual('');
    }
  }, [visible]);

  const enviar = (codigo: string) => {
    const limpio = codigo.trim();
    if (!limpio) return;
    setYaEscaneo(true);
    onScanned(limpio);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: palette.cosmicVoid }}>
        {/* Barra superior */}
        <View
          style={{
            paddingTop: insets.top + 12,
            paddingHorizontal: 24,
            paddingBottom: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>Escanear código</Text>
          <TouchableOpacity
            onPress={onClose}
            accessibilityLabel="Cerrar escáner"
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255,255,255,0.15)',
            }}>
            <X size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Cámara */}
        <View style={{ flex: 1, marginHorizontal: 24, borderRadius: 20, overflow: 'hidden', backgroundColor: '#000' }}>
          {!permission ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: palette.shyMoment }}>Preparando la cámara...</Text>
            </View>
          ) : !permission.granted ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
              <Text style={{ color: '#FFFFFF', textAlign: 'center', marginBottom: 16 }}>
                Necesitamos permiso para usar la cámara y leer los códigos.
              </Text>
              <TouchableOpacity
                onPress={requestPermission}
                style={{ backgroundColor: palette.dragonlord, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 }}>
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Permitir cámara</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <CameraView
                style={{ flex: 1 }}
                facing="back"
                barcodeScannerSettings={{
                  barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'qr'],
                }}
                onBarcodeScanned={yaEscaneo ? undefined : ({ data }) => enviar(data)}
              />
              {/* Marco guía */}
              <View
                pointerEvents="none"
                style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center' }}>
                <View
                  style={{
                    width: '75%',
                    height: 160,
                    borderRadius: 16,
                    borderWidth: 3,
                    borderColor: palette.shyMoment,
                  }}
                />
              </View>
            </>
          )}
        </View>

        {/* Ingreso manual */}
        <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: insets.bottom + 16 }}>
          <Text style={{ color: palette.shyMoment, fontSize: 12, marginBottom: 8 }}>
            Apunta al código de barras, o escríbelo a mano:
          </Text>
          <View style={{ flexDirection: 'row' }}>
            <TextInput
              style={{
                flex: 1,
                height: 48,
                borderRadius: 12,
                paddingHorizontal: 16,
                backgroundColor: 'rgba(255,255,255,0.12)',
                color: '#FFFFFF',
              }}
              placeholder="Ej: 7790001000011"
              placeholderTextColor="#8F8CCB"
              value={manual}
              onChangeText={setManual}
              autoCapitalize="none"
              onSubmitEditing={() => enviar(manual)}
            />
            <TouchableOpacity
              onPress={() => enviar(manual)}
              style={{
                marginLeft: 8,
                paddingHorizontal: 18,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: palette.dragonlord,
              }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Buscar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}