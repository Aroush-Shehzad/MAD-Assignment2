import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function MoviesScreen({ navigation }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://reactnative.dev/movies.json');
      const data = await response.json();
      setMovies(data.movies);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMovies();
  };

  const getRandomColor = (index) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7B05E'];
    return colors[index % colors.length];
  };

  const getInitial = (title) => {
    return title.charAt(0).toUpperCase();
  };

  const renderMovie = ({ item, index }) => (
    <TouchableOpacity
      style={styles.movieCard}
      activeOpacity={0.7}
      onPress={() => Alert.alert(item.title, `Release Year: ${item.releaseYear}`)}
    >
      <View style={[styles.movieIcon, { backgroundColor: getRandomColor(index) }]}>
        <Text style={styles.movieIconText}>{getInitial(item.title)}</Text>
      </View>
      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle}>{item.title}</Text>
        <View style={styles.yearContainer}>
          <Ionicons name="calendar-outline" size={14} color="#999" />
          <Text style={styles.movieYear}>{item.releaseYear}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  const MovieSkeleton = () => (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonIcon} />
      <View style={styles.skeletonInfo}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonYear} />
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <View style={styles.loaderContainer}>
          <View style={styles.loaderContent}>
            <ActivityIndicator size="large" color="#5856D6" />
            <Text style={styles.loaderText}>Fetching Movies...</Text>
            <Text style={styles.loaderSubtext}>Getting the latest releases</Text>
          </View>
          <View style={styles.skeletonContainer}>
            {[1, 2, 3, 4].map((i) => (
              <MovieSkeleton key={i} />
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Movies</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          🎬 {movies.length} movies available
        </Text>
      </View>

      {/* Movies List */}
      <FlatList
        data={movies}
        renderItem={renderMovie}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListHeaderComponent={
          <Text style={styles.listHeader}>Popular Movies</Text>
        }
      />
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  headerRight: {
    width: 32,
  },
  statsBar: {
    backgroundColor: '#2a7469',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  statsText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  listHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginVertical: 16,
  },
  movieCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  movieIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  movieIconText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  movieInfo: {
    flex: 1,
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  yearContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  movieYear: {
    fontSize: 13,
    color: '#999',
  },
  loaderContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loaderContent: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },
  loaderText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  loaderSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
  },
  skeletonContainer: {
    marginTop: 20,
  },
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  skeletonIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#e0e0e0',
    marginRight: 16,
  },
  skeletonInfo: {
    flex: 1,
  },
  skeletonTitle: {
    width: '70%',
    height: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 8,
  },
  skeletonYear: {
    width: '40%',
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
  },
});