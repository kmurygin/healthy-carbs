import {TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient} from '@angular/common/http';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';

import {AllergenService} from './allergen.service';
import {ApiEndpoints} from '@core/constants/api-endpoints';

describe('AllergenService', () => {
  let service: AllergenService;
  let httpMock: HttpTestingController;

  const mockAllergen = {id: 1, name: 'Gluten'};

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AllergenService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AllergenService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('service_whenInjected_shouldBeTruthy', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('getAll_whenSuccess_shouldReturnAllergens', () => {
      service.getAll().subscribe((allergens) => {
        expect(allergens).toEqual([mockAllergen]);
      });

      const req = httpMock.expectOne(ApiEndpoints.Allergens.Base);
      expect(req.request.method).toBe('GET');
      req.flush({data: [mockAllergen]});
    });

    it('getAll_whenDataNull_shouldReturnEmptyArray', () => {
      service.getAll().subscribe((allergens) => {
        expect(allergens).toEqual([]);
      });

      const req = httpMock.expectOne(ApiEndpoints.Allergens.Base);
      req.flush({data: null});
    });
  });

  describe('create', () => {
    it('create_whenSuccess_shouldReturnAllergen', () => {
      service.create('Gluten').subscribe((allergen) => {
        expect(allergen).toEqual(mockAllergen);
      });

      const req = httpMock.expectOne(ApiEndpoints.Allergens.Base);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({name: 'Gluten'});
      req.flush({data: mockAllergen});
    });

    it('create_whenDataNull_shouldThrowError', () => {
      service.create('Gluten').subscribe({
        error: (err: unknown) => {
          expect((err as Error).message).toContain('Allergen data is missing');
        },
      });

      const req = httpMock.expectOne(ApiEndpoints.Allergens.Base);
      req.flush({data: null});
    });
  });

  describe('delete', () => {
    it('delete_whenSuccess_shouldReturnVoid', () => {
      service.delete(1).subscribe((result) => {
        expect(result).toBeUndefined();
      });

      const req = httpMock.expectOne(`${ApiEndpoints.Allergens.Base}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });
});
