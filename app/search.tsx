import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TraderCard } from '../components/TraderCard';
import { useProtectedRoute } from '../hooks/useProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import { searchTraders, TraderWithStats } from '../lib/traderService';
import { getSearchHistory, addSearchHistory, clearSearchHistory } from '../lib/searchHistoryService';

const COLORS = {
  primary: "#2ebd85",
  background: "#000000",
  surface: "#131313",
  surfaceLight: "#1c1c1e",
  textMain: "#ffffff",
  textMuted: "#9ca3af",
  border: "#27272a",
};

export default function SearchScreen() {
  useProtectedRoute();
  const router = useRouter();
  const { user } = useAuth();
  
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [results, setResults] = useState<TraderWithStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // 加载搜索历史
  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    try {
      const savedHistory = await getSearchHistory();
      setHistory(savedHistory);
    } catch (error) {
      console.error('加载搜索历史失败:', error);
    }
  };

  // 执行搜索
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const searchResults = await searchTraders(searchQuery, user?.id);
      setResults(searchResults);
    } catch (error) {
      console.error('搜索失败:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // 输入变化时，使用防抖
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (query.trim() === '') {
      setResults([]);
      setLoading(false);
    } else {
      setLoading(true);
      const timeout = setTimeout(() => {
        performSearch(query);
      }, 500); // 500ms 防抖
      setSearchTimeout(timeout);
    }

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [query]);

  const handleSearch = (text: string) => {
    setQuery(text);
  };

  const handleSelectHistory = async (text: string) => {
    setQuery(text);
    await addSearchHistory(text);
    await loadSearchHistory();
  };

  const handleClearHistory = async () => {
    await clearSearchHistory();
    setHistory([]);
  };

  const handleTraderPress = async (trader: TraderWithStats) => {
    // 保存搜索历史
    if (query.trim()) {
      await addSearchHistory(query.trim());
      await loadSearchHistory();
    }
    
    // 跳转到交易员详情页
    router.push({
      pathname: '/trader/detail',
      params: { traderId: trader.id }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)?tab=copy')} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.textMain} />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color={COLORS.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="搜索交易员名称或描述..."
            placeholderTextColor={COLORS.textMuted}
            value={query}
            onChangeText={handleSearch}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <MaterialIcons name="close" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {query.trim() === '' ? (
        <View style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>搜索历史</Text>
            {history.length > 0 && (
              <TouchableOpacity onPress={handleClearHistory}>
                <MaterialIcons name="delete-outline" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>
          {history.length > 0 ? (
            <View style={styles.historyTags}>
              {history.map((item, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.historyTag}
                  onPress={() => handleSelectHistory(item)}
                >
                  <Text style={styles.historyTagText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>暂无搜索历史</Text>
            </View>
          )}
        </View>
      ) : loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>搜索中...</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsList}
          renderItem={({ item }) => (
            <TraderCard
              traderId={item.id}
              name={item.name}
              avatar={item.avatar_url || ''}
              followers={item.followers_count || 0}
              maxFollowers={100}
              description={item.description || ''}
              roi={`${item.win_rate || 0}%`}
              roiLabel="胜率"
              pnl={`${item.total_signals || 0} 信号`}
              winRate={`${item.win_rate || 0}%`}
              aum={`${item.active_signals || 0} 活跃`}
              days={0}
              coins={[]}
              chartPath="M0,35 Q10,32 20,30 T40,20 T60,25 T80,10 L100,20"
              initialIsSubscribed={item.is_subscribed}
              initialIsFavorite={item.is_followed}
              onPress={() => handleTraderPress(item)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialIcons name="search-off" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>未找到匹配的交易员</Text>
              <Text style={styles.emptySubtext}>试试其他关键词</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    ...(Platform.OS === 'web' && {
      position: 'fixed' as any,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      touchAction: 'pan-y' as any,
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    padding: 4,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  input: {
    flex: 1,
    color: COLORS.textMain,
    fontSize: 16,
    padding: 0,
    ...(Platform.OS === 'web' && {
      outlineStyle: 'none' as any,
    }),
  },
  historyContainer: {
    padding: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    color: COLORS.textMain,
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  historyTag: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  historyTagText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  resultsList: {
    padding: 16,
    gap: 12,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 16,
    marginTop: 12,
  },
  emptySubtext: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: 12,
  },
});
