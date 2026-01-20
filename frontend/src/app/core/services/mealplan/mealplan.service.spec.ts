import {TestBed} from '@angular/core/testing';
import {MealPlanService} from './mealplan.service';
import {HttpTestingController, provideHttpClientTesting} from "@angular/common/http/testing";
import {provideHttpClient} from "@angular/common/http";
import {ApiEndpoints} from "../../constants/api-endpoints";
import type {MealPlanDto} from "../../models/dto/mealplan.dto";
import type {CreateMealPlanRequest} from "@features/dietitian/meal-plan-creator/meal-plan-creator.util";
import {MealPlanSource} from "../../models/enum/mealplan-source.enum";
import {REGULAR_TEST_USER} from "@testing/test-data.util";

describe('MealPlanService', () => {
  let service: MealPlanService;
  let httpMock: HttpTestingController;

  const mockMealPlan: MealPlanDto = {
    id: 1,
    user: REGULAR_TEST_USER,
    createdAt: '2026-01-01',
    days: [],
    totalCalories: 2000,
    totalCarbs: 200,
    totalFat: 70,
    totalProtein: 150,
    source: MealPlanSource.GENERATED
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MealPlanService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });
    service = TestBed.inject(MealPlanService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('generate', () => {
    it('should POST to ApiEndpoints.MealPlan.Base and return plan on success', () => {
      service.generate().subscribe(plan => {
        expect(plan).toEqual(mockMealPlan);
      });

      const req = httpMock.expectOne(ApiEndpoints.MealPlan.Base);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBeNull();
      req.flush({data: mockMealPlan});
    });

    it('should throw error if response data is missing', () => {
      service.generate().subscribe({
        next: () => {
          fail('expected error');
        },
        error: (err: unknown) => {
          expect(err instanceof Error
            ? err.message
            : String(err))
            .toContain('Failed to generate meal plan');
        }
      });

      const req = httpMock.expectOne(ApiEndpoints.MealPlan.Base);
      req.flush({data: null});
    });
  });

  describe('getHistory', () => {
    it('should GET from history endpoint and return array', () => {
      const mockHistory = [mockMealPlan];
      service.getHistory().subscribe(history => {
        expect(history).toEqual(mockHistory);
      });

      const req = httpMock.expectOne(ApiEndpoints.MealPlan.Base + '/history');
      expect(req.request.method).toBe('GET');
      req.flush({data: mockHistory});
    });

    it('should return empty array if data is null', () => {
      service.getHistory().subscribe(history => {
        expect(history).toEqual([]);
      });

      const req = httpMock.expectOne(ApiEndpoints.MealPlan.Base + '/history');
      req.flush({data: null});
    });
  });

  describe('downloadPdf', () => {
    it('should GET download endpoint with blob response type', () => {
      const mockBlob = new Blob(['PDF content'], {type: 'application/pdf'});
      service.downloadPdf(123).subscribe(blob => {
        expect(blob).toEqual(mockBlob);
      });

      const req = httpMock.expectOne(`${ApiEndpoints.MealPlan.Base}/123/download`);
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });
  });

  describe('getById', () => {
    it('should GET by ID and return plan', () => {
      service.getById(1).subscribe(plan => {
        expect(plan).toEqual(mockMealPlan);
      });

      const req = httpMock.expectOne(`${ApiEndpoints.MealPlan.Base}/1`);
      expect(req.request.method).toBe('GET');
      req.flush({data: mockMealPlan});
    });

    it('should throw error if not found (data null)', () => {
      service.getById(99).subscribe({
        next: () => {
          fail('expected error');
        },
        error: (err: unknown) => {
          expect(err instanceof Error
            ? err.message
            : String(err))
            .toContain('Meal plan with id 99 not found');
        }
      });

      const req = httpMock.expectOne(`${ApiEndpoints.MealPlan.Base}/99`);
      req.flush({data: null});
    });
  });

  describe('createManual', () => {
    it('should POST to manual endpoint and return plan', () => {
      const request: CreateMealPlanRequest = {clientId: 1, startDate: '2026-01-01', days: []};
      service.createManual(request).subscribe(plan => {
        expect(plan).toEqual(mockMealPlan);
      });

      const req = httpMock.expectOne(`${ApiEndpoints.MealPlan.Base}/manual`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush({data: mockMealPlan});
    });

    it('should throw error if creation fails', () => {
      const request: CreateMealPlanRequest = {clientId: 1, startDate: '2026-01-01', days: []};
      service.createManual(request).subscribe({
        next: () => {
          fail('should have failed');
        },
        error: (err: unknown) => {
          expect(err instanceof Error
            ? err.message
            : String(err))
            .toBe('Failed to create meal plan');
        }
      });

      const req = httpMock.expectOne(`${ApiEndpoints.MealPlan.Base}/manual`);
      req.flush({data: null});
    });
  });
});
