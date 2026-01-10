import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Signal } from '../lib/signalService';

const COLORS = {
  primary: "#2ebd85",
  danger: "#f6465d",
  background: "#000000",
  surface: "#131313",
  surfaceLight: "#1c1c1e",
  textMain: "#ffffff",
  textMuted: "#9ca3af",
  border: "#27272a",
  yellow: "#eab308",
};

interface CopySignalModalProps {
  visible: boolean;
  signal: Signal | null;
  onClose: () => void;
  onConfirm?: (editedData: {
    entryPrice: string;
    takeProfit: string;
    stopLoss: string;
  }) => void;
}

export const CopySignalModal: React.FC<CopySignalModalProps> = ({
  visible,
  signal,
  onClose,
  onConfirm,
}) => {
  const [editableData, setEditableData] = useState({
    entryPrice: '',
    takeProfit: '',
    stopLoss: '',
  });

  // 当信号变化时更新可编辑数据
  useEffect(() => {
    if (signal) {
      setEditableData({
        entryPrice: signal.entry_price,
        takeProfit: signal.take_profit,
        stopLoss: signal.stop_loss,
      });
    }
  }, [signal]);

  // 计算盈亏比
  const calculateProfitLossRatio = (
    entryPrice: string,
    takeProfit: string,
    stopLoss: string,
    direction: 'long' | 'short'
  ) => {
    const entry = parseFloat(entryPrice);
    const tp = parseFloat(takeProfit);
    const sl = parseFloat(stopLoss);

    if (isNaN(entry) || isNaN(tp) || isNaN(sl)) return '-';

    let profit = 0;
    let loss = 0;

    if (direction === 'long') {
      profit = tp - entry;
      loss = entry - sl;
    } else {
      profit = entry - tp;
      loss = sl - entry;
    }

    if (loss <= 0) return '-';
    const ratio = profit / loss;
    return `${ratio.toFixed(2)}:1`;
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(editableData);
    }
    onClose();
  };

  if (!signal) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>复制交易信号</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={COLORS.textMain} />
            </TouchableOpacity>
          </View>

          {/* Modal Content */}
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* 不可编辑字段 */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>交易对</Text>
              <View style={styles.formInputDisabled}>
                <Text style={styles.formInputDisabledText}>{signal.currency}</Text>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>方向</Text>
              <View style={styles.formInputDisabled}>
                <Text
                  style={[
                    styles.formInputDisabledText,
                    {
                      color: signal.direction === 'long' ? COLORS.primary : COLORS.danger,
                    },
                  ]}
                >
                  {signal.direction === 'long' ? '做多' : '做空'}
                </Text>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>杠杆</Text>
              <View style={styles.formInputDisabled}>
                <Text style={styles.formInputDisabledText}>{signal.leverage}x</Text>
              </View>
            </View>

            {/* 可编辑字段 */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>入场价</Text>
              <TextInput
                style={styles.formInput}
                value={editableData.entryPrice === '未提供' ? '' : editableData.entryPrice}
                onChangeText={(text) =>
                  setEditableData({ ...editableData, entryPrice: text })
                }
                keyboardType="decimal-pad"
                placeholder="请输入入场价"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>止盈价</Text>
              <TextInput
                style={styles.formInput}
                value={editableData.takeProfit === '未提供' ? '' : editableData.takeProfit}
                onChangeText={(text) =>
                  setEditableData({ ...editableData, takeProfit: text })
                }
                keyboardType="decimal-pad"
                placeholder="请输入止盈价"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>止损价</Text>
              <TextInput
                style={styles.formInput}
                value={editableData.stopLoss === '未提供' ? '' : editableData.stopLoss}
                onChangeText={(text) =>
                  setEditableData({ ...editableData, stopLoss: text })
                }
                keyboardType="decimal-pad"
                placeholder="请输入止损价"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            {/* 盈亏比 - 自动计算 */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>盈亏比</Text>
              <View style={styles.formInputDisabled}>
                <Text style={[styles.formInputDisabledText, { color: COLORS.yellow }]}>
                  {calculateProfitLossRatio(
                    editableData.entryPrice,
                    editableData.takeProfit,
                    editableData.stopLoss,
                    signal.direction
                  )}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Modal Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.modalCancelButton} onPress={onClose}>
              <Text style={styles.modalCancelButtonText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalConfirmButton} onPress={handleConfirm}>
              <Text style={styles.modalConfirmButtonText}>确认复制</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    color: COLORS.textMain,
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 20,
    maxHeight: 400,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  formInput: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: COLORS.textMain,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  formInputDisabled: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    opacity: 0.6,
  },
  formInputDisabledText: {
    color: COLORS.textMain,
    fontSize: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalCancelButtonText: {
    color: COLORS.textMain,
    fontSize: 16,
    fontWeight: '600',
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalConfirmButtonText: {
    color: COLORS.textMain,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
