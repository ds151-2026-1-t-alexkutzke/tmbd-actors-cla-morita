import { Link, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  FlatList,
  Pressable,
} from 'react-native';
import { api } from '../../src/api/tmdb';

interface MovieDetails {
  title: string;
  overview: string;
  poster_path: string | null;
  vote_average: number;
  runtime: number;
}

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export default function MovieDetailsScreen() {
  // Captura o parâmetro '[id]' do nome do arquivo
  const { id } = useLocalSearchParams();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const [movieResponse, creditsResponse] = await Promise.all([
          api.get(`/movie/${id}`),
          api.get(`/movie/${id}/credits`),
        ]);

        setMovie(movieResponse.data);
        setCast((creditsResponse.data.cast || []).slice(0, 10));
      } catch (error) {
        console.error('Erro ao buscar detalhes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]); // O hook é re-executado caso o ID mude

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  if (!movie) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Filme não encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {movie.poster_path && (
        <Image
          source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }}
          style={styles.poster}
          resizeMode="cover"
        />
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{movie.title}</Text>

        <View style={styles.statsContainer}>
          <Text style={styles.statText}>⭐ {movie.vote_average.toFixed(1)}/10</Text>
          <Text style={styles.statText}>⏱️ {movie.runtime} min</Text>
        </View>

        <Text style={styles.sectionTitle}>Sinopse</Text>
        <Text style={styles.overview}>
          {movie.overview || 'Sinopse não disponível para este filme.'}
        </Text>

        <Text style={styles.sectionTitle}>Elenco principal</Text>
        {cast.length > 0 ? (
          <FlatList
            data={cast}
            horizontal
            keyExtractor={(item) => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.castList}
            renderItem={({ item }) => (
              <Link href={`/actor/${item.id}`} asChild>
                <Pressable style={styles.castCard}>
                  {item.profile_path ? (
                    <Image
                      source={{ uri: `https://image.tmdb.org/t/p/w185${item.profile_path}` }}
                      style={styles.castImage}
                    />
                  ) : (
                    <View style={styles.castPlaceholder}>
                      <Text style={styles.placeholderText}>Sem foto</Text>
                    </View>
                  )}
                  <Text style={styles.castName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.castCharacter} numberOfLines={2}>
                    {item.character || 'Personagem não informado'}
                  </Text>
                </Pressable>
              </Link>
            )}
          />
        ) : (
          <Text style={styles.emptyText}>Elenco não disponível.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  poster: { width: '100%', height: 400 },
  content: { padding: 20 },
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  statsContainer: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  statText: { color: '#E50914', fontSize: 16, fontWeight: '600' },
  sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  overview: { color: '#D1D5DB', fontSize: 16, lineHeight: 24 },
  errorText: { color: '#FFFFFF', fontSize: 18 },
  castList: { paddingVertical: 8 },
  castCard: { width: 110, marginRight: 12 },
  castImage: {
    width: 110,
    height: 165,
    borderRadius: 12,
    backgroundColor: '#333333',
  },
  castPlaceholder: {
    width: 110,
    height: 165,
    borderRadius: 12,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  castName: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', marginTop: 8 },
  castCharacter: { color: '#9CA3AF', fontSize: 12, marginTop: 4 },
  placeholderText: { color: '#9CA3AF', fontSize: 12 },
  emptyText: { color: '#9CA3AF', fontSize: 14, marginTop: 4 },
});
