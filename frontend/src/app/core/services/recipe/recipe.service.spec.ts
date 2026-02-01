import {TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient} from '@angular/common/http';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';

import {RecipeService} from './recipe.service';
import {ApiEndpoints} from '@core/constants/api-endpoints';
import {createMockRecipe} from '@testing/test-data.util';
import type {RecipeSearchParams} from '@core/models/recipe-search.params';

describe('RecipeService', () => {
  let service: RecipeService;
  let httpMock: HttpTestingController;

  const mockRecipe = createMockRecipe();
  const defaultParams: RecipeSearchParams = {page: 0, size: 10};

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RecipeService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(RecipeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('service_whenInjected_shouldBeTruthy', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('getAll_whenSuccess_shouldReturnPage', () => {
      const mockPage = {
        content: [mockRecipe],
        totalPages: 1,
        totalElements: 1,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: false
      };

      service.getAll(defaultParams).subscribe((page) => {
        expect(page).toEqual(mockPage);
      });

      const req = httpMock.expectOne((r) => r.url === ApiEndpoints.Recipes.Base);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('0');
      expect(req.request.params.get('size')).toBe('10');
      req.flush({data: mockPage});
    });

    it('getAll_whenDataNull_shouldReturnEmptyPage', () => {
      service.getAll(defaultParams).subscribe((page) => {
        expect(page.content).toEqual([]);
        expect(page.empty).toBe(true);
      });

      const req = httpMock.expectOne((r) => r.url === ApiEndpoints.Recipes.Base);
      req.flush({data: null});
    });

    it('getAll_whenHttpError_shouldReturnEmptyPage', () => {
      service.getAll(defaultParams).subscribe((page) => {
        expect(page.content).toEqual([]);
        expect(page.empty).toBe(true);
      });

      const req = httpMock.expectOne((r) => r.url === ApiEndpoints.Recipes.Base);
      req.flush('Error', {status: 500, statusText: 'Server Error'});
    });

    it('getAll_whenFiltersProvided_shouldSetParams', () => {
      const params: RecipeSearchParams = {
        page: 0, size: 10, name: 'pasta', ingredient: 'tomato',
        diet: 'VEGAN', meal: 'DINNER', onlyFavourites: true, sort: 'name,asc'
      };

      service.getAll(params).subscribe();

      const req = httpMock.expectOne((r) => r.url === ApiEndpoints.Recipes.Base);
      expect(req.request.params.get('name')).toBe('pasta');
      expect(req.request.params.get('ingredient')).toBe('tomato');
      expect(req.request.params.get('diet')).toBe('VEGAN');
      expect(req.request.params.get('meal')).toBe('DINNER');
      expect(req.request.params.get('onlyFavourites')).toBe('true');
      expect(req.request.params.get('sort')).toBe('name,asc');
      req.flush({
        data: {
          content: [],
          totalPages: 0,
          totalElements: 0,
          size: 10,
          number: 0,
          first: true,
          last: true,
          empty: true
        }
      });
    });
  });

  describe('getById', () => {
    it('getById_whenFound_shouldReturnRecipe', () => {
      service.getById(1).subscribe((recipe) => {
        expect(recipe).toEqual(mockRecipe);
      });

      const req = httpMock.expectOne(`${ApiEndpoints.Recipes.Base}/1`);
      expect(req.request.method).toBe('GET');
      req.flush({data: mockRecipe});
    });

    it('getById_whenDataNull_shouldReturnNull', () => {
      service.getById(1).subscribe((recipe) => {
        expect(recipe).toBeNull();
      });

      const req = httpMock.expectOne(`${ApiEndpoints.Recipes.Base}/1`);
      req.flush({data: null});
    });

    it('getById_whenHttpError_shouldReturnNull', () => {
      service.getById(1).subscribe((recipe) => {
        expect(recipe).toBeNull();
      });

      const req = httpMock.expectOne(`${ApiEndpoints.Recipes.Base}/1`);
      req.flush('Not found', {status: 404, statusText: 'Not Found'});
    });
  });

  describe('create', () => {
    it('create_whenSuccess_shouldReturnRecipe', () => {
      service.create(mockRecipe).subscribe((recipe) => {
        expect(recipe).toEqual(mockRecipe);
      });

      const req = httpMock.expectOne(ApiEndpoints.Recipes.Base);
      expect(req.request.method).toBe('POST');
      req.flush({data: mockRecipe});
    });

    it('create_whenHttpError_shouldReturnNull', () => {
      service.create(mockRecipe).subscribe((recipe) => {
        expect(recipe).toBeNull();
      });

      const req = httpMock.expectOne(ApiEndpoints.Recipes.Base);
      req.flush('Error', {status: 400, statusText: 'Bad Request'});
    });
  });

  describe('update', () => {
    it('update_whenSuccess_shouldReturnRecipe', () => {
      service.update(1, mockRecipe).subscribe((recipe) => {
        expect(recipe).toEqual(mockRecipe);
      });

      const req = httpMock.expectOne(`${ApiEndpoints.Recipes.Base}/1`);
      expect(req.request.method).toBe('PUT');
      req.flush({data: mockRecipe});
    });

    it('update_whenHttpError_shouldReturnNull', () => {
      service.update(1, mockRecipe).subscribe((recipe) => {
        expect(recipe).toBeNull();
      });

      const req = httpMock.expectOne(`${ApiEndpoints.Recipes.Base}/1`);
      req.flush('Error', {status: 400, statusText: 'Bad Request'});
    });
  });

  describe('delete', () => {
    it('delete_whenCalled_shouldDeleteRecipe', () => {
      service.delete(1).subscribe((res) => {
        expect(res).toBeDefined();
      });

      const req = httpMock.expectOne(`${ApiEndpoints.Recipes.Base}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  describe('addFavourite', () => {
    it('addFavourite_whenCalled_shouldPostToFavourite', () => {
      service.addFavourite(1).subscribe((res) => {
        expect(res).toBeNull();
      });

      const req = httpMock.expectOne(`${ApiEndpoints.Recipes.Base}/1/favourite`);
      expect(req.request.method).toBe('POST');
      req.flush(null);
    });
  });

  describe('removeFavourite', () => {
    it('removeFavourite_whenCalled_shouldDeleteFavourite', () => {
      service.removeFavourite(1).subscribe((res) => {
        expect(res).toBeNull();
      });

      const req = httpMock.expectOne(`${ApiEndpoints.Recipes.Base}/1/favourite`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
