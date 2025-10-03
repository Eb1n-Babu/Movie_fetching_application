from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import requests
from django.conf import settings


class ConfigView(APIView):
    def get(self, request):
        try:
            genres = requests.get(f"{settings.TMDB_BASE_URL}/genre/movie/list?api_key={settings.TMDB_API_KEY}").json()[
                'genres']
            languages = requests.get(
                f"{settings.TMDB_BASE_URL}/configuration/languages?api_key={settings.TMDB_API_KEY}").json()
            countries = requests.get(
                f"{settings.TMDB_BASE_URL}/configuration/countries?api_key={settings.TMDB_API_KEY}").json()
            return Response({
                'genres': genres,
                'languages': languages,
                'countries': countries
            })
        except requests.RequestException as e:
            return Response({'error': 'Failed to load configuration'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MovieView(APIView):
    def get(self, request):
        api_source = request.query_params.get('api_source', 'TMDB')
        search_query = request.query_params.get('search_query', '')
        genre = request.query_params.get('genre', '')
        language = request.query_params.get('language', '')
        country = request.query_params.get('country', '')
        year = request.query_params.get('year', '')
        min_rating = request.query_params.get('min_rating', '')
        sort_by = request.query_params.get('sort_by', 'popularity.desc')
        min_runtime = request.query_params.get('min_runtime', '')
        max_runtime = request.query_params.get('max_runtime', '')
        with_cast = request.query_params.get('with_cast', '')

        try:
            if api_source == 'TMDB':
                params = {
                    'api_key': settings.TMDB_API_KEY,
                    'with_genres': genre,
                    'with_original_language': language,
                    'region': country,
                    'primary_release_year': year,
                    'vote_average.gte': min_rating,
                    'sort_by': sort_by,
                    'runtime.gte': min_runtime,
                    'runtime.lte': max_runtime,
                }
                if with_cast:
                    person_res = requests.get(
                        f"{settings.TMDB_BASE_URL}/search/person?api_key={settings.TMDB_API_KEY}&query={with_cast}").json()
                    if person_res['results']:
                        params['with_cast'] = person_res['results'][0]['id']

                endpoint = '/search/movie' if search_query else '/discover/movie'
                if search_query:
                    params['query'] = search_query
                res = requests.get(f"{settings.TMDB_BASE_URL}{endpoint}", params=params).json()
                movies = res.get('results', [])
            else:  # OMDb
                params = {
                    'apikey': settings.OMDB_API_KEY,
                    's': search_query or '*',
                    'y': year,
                    'type': 'movie'
                }
                res = requests.get(settings.OMDB_BASE_URL, params=params).json()
                movies = res.get('Search', [])

            return Response({'movies': movies})
        except requests.RequestException as e:
            return Response({'error': 'Failed to fetch movies'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
