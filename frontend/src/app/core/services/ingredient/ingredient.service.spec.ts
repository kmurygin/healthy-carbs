import {TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient} from '@angular/common/http';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';

import {IngredientService} from './ingredient.service';
import {ApiEndpoints} from '@core/constants/api-endpoints';
import {createMockIngredient} from '@testing/test-data.util';
import {IngredientCategory} from '@core/models/enum/ingredient-category.enum';

describe('IngredientService', () => {
  let service: IngredientService;
  let httpMock: HttpTestingController;

  const mockIngredient = createMockIngredient();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IngredientService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(IngredientService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('service_whenInjected_shouldBeTruthy', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('getAll_whenSuccess_shouldReturnIngredients', () => {
      service.getAll().subscribe((ingredients) => {
        expect(ingredients).toEqual([mockIngredient]);
      });

      const req = httpMock.expectOne(ApiEndpoints.Ingredients.Base);
      expect(req.request.method).toBe('GET');
      req.flush({data: [mockIngredient]});
    });

    it('getAll_whenDataNull_shouldReturnNull', () => {
      service.getAll().subscribe((ingredients) => {
        expect(ingredients).toBeNull();
      });

      const req = httpMock.expectOne(ApiEndpoints.Ingredients.Base);
      req.flush({data: null});
    });

    it('getAll_whenHttpError_shouldReturnNull', () => {
      service.getAll().subscribe((ingredients) => {
        expect(ingredients).toBeNull();
      });

      const req = httpMock.expectOne(ApiEndpoints.Ingredients.Base);
      req.flush('Error', {status: 500, statusText: 'Server Error'});
    });
  });

  describe('getAllPage', () => {
    it('getAllPage_whenSuccess_shouldReturnPage', () => {
      const mockPage = {
        content: [mockIngredient],
        totalPages: 1,
        totalElements: 1,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: false
      };

      service.getAllPage({page: 0, size: 10}).subscribe((page) => {
        expect(page).toEqual(mockPage);
      });

      const req = httpMock.expectOne((r) => r.url === ApiEndpoints.Ingredients.Page);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('0');
      expect(req.request.params.get('size')).toBe('10');
      req.flush({data: mockPage});
    });

    it('getAllPage_whenFiltersProvided_shouldSetParams', () => {
      service.getAllPage({
        page: 0,
        size: 10,
        name: 'rice',
        category: IngredientCategory.GRAINS,
        onlyMine: true
      }).subscribe();

      const req = httpMock.expectOne((r) => r.url === ApiEndpoints.Ingredients.Page);
      expect(req.request.params.get('name')).toBe('rice');
      expect(req.request.params.get('category')).toBe('GRAINS');
      expect(req.request.params.get('onlyMine')).toBe('true');
      req.flush({data: null});
    });

    it('getAllPage_whenHttpError_shouldReturnNull', () => {
      service.getAllPage({page: 0, size: 10}).subscribe((page) => {
        expect(page).toBeNull();
      });

      const req = httpMock.expectOne((r) => r.url === ApiEndpoints.Ingredients.Page);
      req.flush('Error', {status: 500, statusText: 'Server Error'});
    });
  });

  describe('getById', () => {
    it('getById_whenFound_shouldReturnIngredient', () => {
      service.getById(1).subscribe((ingredient) => {
        expect(ingredient).toEqual(mockIngredient);
      });

      const req = httpMock.expectOne(`${ApiEndpoints.Ingredients.Base}/1`);
      expect(req.request.method).toBe('GET');
      req.flush({data: mockIngredient});
    });

    it('getById_whenHttpError_shouldReturnNull', () => {
      service.getById(1).subscribe((ingredient) => {
        expect(ingredient).toBeNull();
      });

      const req = httpMock.expectOne(`${ApiEndpoints.Ingredients.Base}/1`);
      req.flush('Not found', {status: 404, statusText: 'Not Found'});
    });
  });

  describe('create', () => {
    it('create_whenSuccess_shouldReturnIngredient', () => {
      service.create(mockIngredient).subscribe((ingredient) => {
        expect(ingredient).toEqual(mockIngredient);
      });

      const req = httpMock.expectOne(ApiEndpoints.Ingredients.Base);
      expect(req.request.method).toBe('POST');
      req.flush({data: mockIngredient});
    });

    it('create_whenHttpError_shouldReturnNull', () => {
      service.create(mockIngredient).subscribe((ingredient) => {
        expect(ingredient).toBeNull();
      });

      const req = httpMock.expectOne(ApiEndpoints.Ingredients.Base);
      req.flush('Error', {status: 400, statusText: 'Bad Request'});
    });
  });

  describe('update', () => {
    it('update_whenSuccess_shouldReturnIngredient', () => {
      service.update(1, mockIngredient).subscribe((ingredient) => {
        expect(ingredient).toEqual(mockIngredient);
      });

      const req = httpMock.expectOne(`${ApiEndpoints.Ingredients.Base}/1`);
      expect(req.request.method).toBe('PUT');
      req.flush({data: mockIngredient});
    });

    it('update_whenHttpError_shouldReturnNull', () => {
      service.update(1, mockIngredient).subscribe((ingredient) => {
        expect(ingredient).toBeNull();
      });

      const req = httpMock.expectOne(`${ApiEndpoints.Ingredients.Base}/1`);
      req.flush('Error', {status: 400, statusText: 'Bad Request'});
    });
  });

  describe('delete', () => {
    it('delete_whenCalled_shouldDeleteIngredient', () => {
      service.delete(1).subscribe((res) => {
        expect(res).toBeNull();
      });

      const req = httpMock.expectOne(`${ApiEndpoints.Ingredients.Base}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
