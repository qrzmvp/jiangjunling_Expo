import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TraderCard } from '../components/TraderCard';

const COLORS = {
  primary: "#2ebd85",
  background: "#000000",
  surface: "#131313",
  surfaceLight: "#1c1c1e",
  textMain: "#ffffff",
  textMuted: "#9ca3af",
  border: "#27272a",
};

const MOCK_TRADERS = [
  {
    name: "zh138",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCA6jm-quFFL4rGgnuqOTX6aa7ja62sdDdo3axzhQrnFedupfbhBgf-e6uQk2UJW6Fw_P6j3rE-Chdj1ROGQUydNYpLFiDKTnaRkds9OmErntL2HdtacO_UqSoB5ba2135lFtLoHiQHxZEScqx0miCEfAjnfV5_KSl5QyMd8yLi2gw_PLYz0wZiLCXKt2wdodUjdjvSKNgWzPDtwupJElJqhtE9RKBIQ9kS_wrdn6X3Mco8KWrf3EmG7376RFVDEW_ffsBfco13qw",
    followers: 46,
    maxFollowers: 100,
    roi: "+7.56%",
    pnl: "+$1,968.88",
    winRate: "63.10%",
    aum: "$7,029.75",
    days: 290,
    coins: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAEcAV67993OCt0DPtM2p8O2VOufk16pTKp8rXdxYzZU8G7G59l0CDW4oL01HveVAtNT8Kh31Z9GKhffkuQDVAasrQHuE6ebVN23WctH5f7nUebYYIynGAqCZBHm1obLP8vwJwmcWrJZWa6EMfh2j2DJYl9_nwAh14I6lW2R3ZM_WibvUnRtI2a_v96J6JPW2yEh_yFxhIxz-NjuG02m8tjKWN6rti6CP0T5pyv_yhFsEtAHivwBNN7IhN3qg66P95nZngpHi5fcQ"
    ],
    chartPath: "M0,35 Q10,32 20,30 T40,20 T60,25 T80,10 L100,20"
  },
  {
    name: "BeyondHJJ",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBzZa78G7eCvQ3Qfir53Hh3en0nyDyqTSQLbXpOwuGfgmNT5K8kK94gFtLZ9c4QsAjTMvLKoJG-ZohYppqv5hWBKiP8tms6JOyEYTUPB-D0glDcbsQTF4Ba9k1opWJScsAodRQkxc1KcoUOmvSt6CsC8FvXUvDGJruHwegzMFzTaFLM_eF5JWZK8HPtqhNbHRWnliPvTu693N4wpz-ZmEZFfhYTq1BUb9135nVBVxM59E0nYYPndbBJBhQkWX9zheGiN9QcioZyIg",
    followers: 15,
    maxFollowers: 100,
    roi: "+32.26%",
    pnl: "+$9,567.86",
    winRate: "57.50%",
    aum: "$3,432.94",
    days: 397,
    coins: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB5BEa1eJ7RTyut5QDtbRnbcjJ5-mr3UyskhB1e5NMl50E8qS7We3bsUKyEIMd9uUgS6IzSdSYh38DU1f-CM1mrSVjDtKcr12vjB1N11w_IRwwb_qSeI7L7Au615sx-FmgHAe4pGkm5QGehKViamzP5_gH42rlQLtmbXs_KrVpfLkT_t4WSltoJsxFY8cPVAoSTwB2hjJW6pB5oiGWvNilSYsbx7hilCTwU9sm18uqe-77YRHFJXuW650Dsih0mOx40On2uZoG_mQ",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDzQvuheaDEXO_pAahI2DC6OOoQh-GT4prgsNS4pMaa6kQ4GMH73HAbe3u1TlhasjEGVWIsF2UU8fuYTyv8R8dzueZC7CV4duhY2IdCp2JPldm1JhcnlB3TpdOL0C8DJsfs7YumHYJdDJxwKN6UsQpCwWksP6SYJDG1TK5jgvFMP2R8bPBy5PCiidhBsV66AOGKidRcrIknZBDi4bly-ZFhdSivj0pgi5Mu7paYKW66riciXUrk_eS6IRo0v3Cu7zsYrkMezFfjfQ",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBehiWHC50o_Y1I-9WK0ZLzs8_cE6ScQ3TJ1E5JRRZdnO80jNAB8sfhY_z4oBej5b7eciccGxm2UJ2wFkO4dI6lhot4C2P9FkdufN-NY_1TSQpxu96I4DZH7zlss4qPS2MCoYrUR9EFcaQHdeOo3EovWDe664NAuYPyyfVI_PsCd83nZGblwen4iHNSU3QyI6GtaFdOzYEIjlTmFaiBrNqwe8ykvFxsUVHfZT3bN-3IC1w9wdCpyrbohukhiWLvlsp2bveDEVvSpA"
    ],
    chartPath: "M0,38 Q20,35 30,28 T50,20 T70,10 L100,5"
  },
  {
    name: "CryptoKing",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    followers: 88,
    maxFollowers: 100,
    roi: "+15.40%",
    pnl: "+$5,120.00",
    winRate: "70.5%",
    aum: "$12,500.00",
    days: 150,
    coins: [],
    chartPath: "M0,30 Q25,25 50,15 T100,10"
  }
];

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<string[]>(['zh138', 'BeyondHJJ', 'Bitcoin']);
  const [results, setResults] = useState<typeof MOCK_TRADERS>([]);

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
    } else {
      const filtered = MOCK_TRADERS.filter(t => 
        t.name.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
    }
  }, [query]);

  const handleSearch = (text: string) => {
    setQuery(text);
  };

  const addToHistory = (text: string) => {
    if (!history.includes(text)) {
      setHistory([text, ...history].slice(0, 10));
    }
  };

  const clearHistory = () => {
    setHistory([]);
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
            style={[styles.input, { outlineStyle: 'none' } as any]}
            placeholder="Search traders..."
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
            <Text style={styles.historyTitle}>Search History</Text>
            <TouchableOpacity onPress={clearHistory}>
              <MaterialIcons name="delete-outline" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
          <View style={styles.historyTags}>
            {history.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.historyTag}
                onPress={() => setQuery(item)}
              >
                <Text style={styles.historyTagText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.name}
          contentContainerStyle={styles.resultsList}
          renderItem={({ item }) => (
            <TraderCard
              {...item}
              onPress={() => {
                addToHistory(item.name);
                router.push('/trader/detail');
              }}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No traders found</Text>
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
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
});
