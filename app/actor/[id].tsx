import { Link, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { api } from '../../src/api/tmdb';

interface ActorDetails {
  id: number;
  name: string;
  biography: string;
  profile_path: string | null;
}

interface MovieCredit {
  id: number;
  title: string;
  poster_path: string | null;
  release_date?: string;
}

export default function ActorScreen() {
  const { id } = useLocalSearchParams();
  const [actor, setActor] = useState<ActorDetails | null>(null);
  const [movies, setMovies] = useState<MovieCredit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActor = async () => {
      try {
        const [personResponse, creditsResponse] = await Promise.all([
          api.get(`/person/${id}`),
          api.get(`/person/${id}/movie_credits`),
        ]);

        setActor(personResponse.data);

        const castMovies = creditsResponse.data.cast || [];
        const uniqueMovies = Array.from(
          new Map(castMovies.map((movie: MovieCredit) => [movie.id, movie])).values()
        ) as MovieCredit[];

        setMovies(
          uniqueMovies.sort((firstMovie, secondMovie) => {
            const firstDate = new Date(firstMovie.release_date || 0).getTime();
            const secondDate = new Date(secondMovie.release_date || 0).getTime();
            return secondDate - firstDate;
          })
        );
      } catch (error) {
        console.error('Erro ao buscar perfil do ator:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActor();
  }, [id]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  if (!actor) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Perfil do ator não encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {actor.profile_path ? (
        <Image
          source={{ uri: `https://image.tmdb.org/t/p/w500${actor.profile_path}` }}
          style={styles.profileImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.profilePlaceholder}>
          <Text style={styles.placeholderText}>Sem foto</Text>
        </View>
      )}

      <Text style={styles.name}>{actor.name}</Text>

      <Text style={styles.sectionTitle}>Biografia</Text>
      <Text style={styles.biography}>
        {actor.biography?.trim() ? actor.biography : 'Biografia não disponível para este artista.'}
      </Text>

      <Text style={styles.sectionTitle}>Filmografia</Text>
      {movies.length > 0 ? (
        <FlatList
          data={movies}
          horizontal
          keyExtractor={(movie) => movie.id.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.moviesList}
          renderItem={({ item }) => (
            <Link href={`/movie/${item.id}`} asChild>
              <Pressable style={styles.movieCard}>
                {item.poster_path ? (
                  <Image
                    source={{ uri: `https://image.tmdb.org/t/p/w185${item.poster_path}` }}
                    style={styles.moviePoster}
                  />
                ) : (
                  <View style={styles.moviePlaceholder}>
                    <Text style={styles.placeholderText}>Sem pôster</Text>
                  </View>
                )}
                <Text style={styles.movieTitle} numberOfLines={2}>
                  {item.title}
                </Text>
              </Pressable>
            </Link>
          )}
        />
      ) : (
        <Text style={styles.emptyText}>Filmografia não disponível.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  contentContainer: { padding: 20, paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  profileImage: {
    width: 180,
    height: 270,
    borderRadius: 18,
    alignSelf: 'center',
    backgroundColor: '#333333',
  },
  profilePlaceholder: {
    width: 180,
    height: 270,
    borderRadius: 18,
    alignSelf: 'center',
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: { color: '#9CA3AF', fontSize: 14 },
  name: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  biography: {
    color: '#D1D5DB',
    fontSize: 16,
    lineHeight: 24,
  },
  moviesList: { paddingVertical: 8 },
  movieCard: { width: 120, marginRight: 12 },
  moviePoster: {
    width: 120,
    height: 180,
    borderRadius: 12,
    backgroundColor: '#333333',
  },
  moviePlaceholder: {
    width: 120,
    height: 180,
    borderRadius: 12,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  movieTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', marginTop: 8 },
  emptyText: { color: '#9CA3AF', fontSize: 14 },
  errorText: { color: '#FFFFFF', fontSize: 18 },
});